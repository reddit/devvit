import type {
  Comment,
  Post,
  RedditAPIClient,
  RedisClient,
  Scheduler,
  ZRangeOptions,
} from '@devvit/public-api';

import Settings from '../settings.json';
import type { Dictionary } from '../types/Dictionary.js';
import type { GameSettings } from '../types/GameSettings.js';
import type {
  CollectionData,
  CollectionPostData,
  DrawingPostData,
  PinnedPostData,
} from '../types/PostData.js';
import type { PostGuesses } from '../types/PostGuesses.js';
import type { ScoreBoardEntry } from '../types/ScoreBoardEntry.js';
import type { UserData } from '../types/UserData.js';
import { getLevelByScore } from '../utils/progression.js';

// Service that handles the backbone logic for the application
// This service is responsible for:
// * Storing and fetching post data for drawings
// * Storing and fetching the score board
// * Storing and fetching user settings
// * Storing and fetching game settings
// * Storing and fetching dynamic dictionaries

export class Service {
  readonly redis: RedisClient;
  readonly reddit?: RedditAPIClient;
  readonly scheduler?: Scheduler;

  constructor(context: { redis: RedisClient; reddit?: RedditAPIClient; scheduler?: Scheduler }) {
    this.redis = context.redis;
    this.reddit = context.reddit;
    this.scheduler = context.scheduler;
  }

  /*
   * Submit Guess
   */

  async submitGuess(event: {
    postData: DrawingPostData;
    username: string;
    guess: string;
    createComment: boolean;
  }): Promise<number> {
    if (!this.reddit || !this.scheduler) {
      console.error('Reddit API client or Scheduler not available in Service');
      return 0;
    }

    // Comment guess
    let comment: Comment | undefined;
    if (event.createComment) {
      try {
        comment = await this.reddit.submitComment({
          id: event.postData.postId,
          text: `I tried **${event.guess}**`,
        });
      } catch (error) {
        if (error) {
          console.error('Failed to submit comment:', error);
        }
        comment = undefined;
      }
    }

    // Increment the counter for this guess
    const guessCount = await this.redis.zIncrBy(
      this.#postGuessesKey(event.postData.postId),
      event.guess,
      1
    );

    // Increment how many guesses the user has made for this post
    await this.redis.zIncrBy(
      this.#postUserGuessCounterKey(event.postData.postId),
      event.username,
      1
    );

    const isCorrect = event.postData.word.toLowerCase() === event.guess;
    const isFirstSolve = isCorrect && guessCount === 1;
    const userPoints = isCorrect
      ? isFirstSolve
        ? Settings.guesserRewardForSolve + Settings.guesserRewardForFirstSolve
        : Settings.guesserRewardForSolve
      : 0;

    // Save guess comment
    if (comment) {
      await this.saveGuessComment(event.postData.postId, event.guess, comment.id);
    }

    if (isCorrect) {
      // Persist that the user has solved the post
      await this.redis.zAdd(this.#postSolvedKey(event.postData.postId), {
        member: event.username,
        score: Date.now(),
      });

      // Give points to drawer
      // TODO: Consider a cap on the number of points a drawer can earn from a single post
      await this.incrementUserScore(
        event.postData.authorUsername,
        Settings.authorRewardForCorrectGuess
      );

      // Give points to guesser
      await this.incrementUserScore(event.username, userPoints);
    }

    // Leave a comment to give props to the first solver.
    // Delayed 5 minutes to reduce spoiling risk.
    if (isFirstSolve) {
      const in5Min = new Date(Date.now() + 5 * 60 * 1000);
      await this.scheduler.runJob({
        name: 'FIRST_SOLVER_COMMENT',
        data: {
          postId: event.postData.postId,
          username: event.username,
        },
        runAt: in5Min,
      });
    }

    return userPoints;
  }

  /*
   * Post User Guess Counter
   *
   * A sorted set that tracks how many guesses each user has made.
   * Mainly used to count how many players there are.
   */

  readonly #postUserGuessCounterKey = (postId: string) => `user-guess-counter:${postId}`;

  async getPlayerCount(postId: string): Promise<number> {
    return await this.redis.zCard(this.#postUserGuessCounterKey(postId));
  }

  /*
   * Post guess comments
   *
   * A hash map of guesses with the commentIds backing them.
   */

  readonly #guessCommentsKey = (postId: string) => `guess-comments:${postId}`;

  async getGuessComments(postId: string): Promise<{ [guess: string]: string[] }> {
    const key = this.#guessCommentsKey(postId);
    const data = await this.redis.hGetAll(key);
    const parsedData: { [guess: string]: string[] } = {};
    Object.entries(data).forEach(([guess, commentId]) => {
      if (!parsedData[guess]) {
        parsedData[guess] = [];
      }
      parsedData[guess].push(commentId);
    });

    return parsedData;
  }

  async getGuessComment(postId: string, commentId: string): Promise<string | undefined> {
    const key = this.#guessCommentsKey(postId);
    return await this.redis.hGet(key, commentId);
  }

  async saveGuessComment(postId: string, guess: string, commentId: string): Promise<void> {
    await this.redis.hSet(this.#guessCommentsKey(postId), { [guess]: commentId });
  }

  async removeGuessComment(postId: string, commentId: string): Promise<void> {
    const key = this.#guessCommentsKey(postId);
    await this.redis.hDel(key, [commentId]);
  }

  /*
   * Pixels management
   *
   * A sorted set for the in-game currency and scoreboard unit
   * - Member: Username
   * - Score: Number of pixels currently held
   */

  readonly scoresKeyTag: string = 'default';
  readonly scoresKey: string = `pixels:${this.scoresKeyTag}`;

  async getScores(maxLength: number = 10): Promise<ScoreBoardEntry[]> {
    const options: ZRangeOptions = { reverse: true, by: 'rank' };
    return await this.redis.zRange(this.scoresKey, 0, maxLength - 1, options);
  }

  async getUserScore(username: string | null): Promise<{
    rank: number;
    score: number;
  }> {
    const defaultValue = { rank: -1, score: 0 };
    if (!username) return defaultValue;
    try {
      const [rank, score] = await Promise.all([
        this.redis.zRank(this.scoresKey, username),
        // TODO: Remove .zScore when .zRank supports the WITHSCORE option
        this.redis.zScore(this.scoresKey, username),
      ]);
      return {
        rank: rank === undefined ? -1 : rank,
        score: score === undefined ? 0 : score,
      };
    } catch (error) {
      if (error) {
        console.error('Error fetching user score board entry', error);
      }
      return defaultValue;
    }
  }

  async incrementUserScore(username: string, amount: number): Promise<number> {
    if (this.scheduler === undefined) {
      console.error('Scheduler not available in Service');
      return 0;
    }
    const key = this.scoresKey;
    const prevScore = (await this.redis.zScore(key, username)) ?? 0;
    const nextScore = await this.redis.zIncrBy(key, username, amount);
    const prevLevel = getLevelByScore(prevScore);
    const nextLevel = getLevelByScore(nextScore);
    if (nextLevel.rank > prevLevel.rank) {
      await this.scheduler.runJob({
        name: 'USER_LEVEL_UP',
        data: {
          username,
          score: nextScore,
          prevLevel,
          nextLevel,
        },
        runAt: new Date(),
      });
    }

    return nextScore;
  }

  /*
   * Post Guesses
   *
   * A sorted set that tracks how many times each guess has been made:
   * - Member: Guess
   * - Score: Count
   */

  readonly #postGuessesKey = (postId: string) => `guesses:${postId}`;

  async getPostGuesses(postId: string): Promise<PostGuesses> {
    const key = this.#postGuessesKey(postId);
    const data = await this.redis.zRange(key, 0, -1);

    const parsedData: PostGuesses = {
      guesses: {},
      wordCount: 0,
      guessCount: 0,
    };

    data.forEach((value) => {
      const { member: guess, score: count } = value;
      parsedData.guesses[guess] = count;
      parsedData.guessCount += count;
      parsedData.wordCount += 1;
    });

    return parsedData;
  }

  /*
   * User Drawings
   *
   * All shared drawings are stored in a sorted set for each player:
   * - Member: Post ID
   * - Score: Unix epoch time
   */

  readonly #userDrawingsKey = (username: string) => `user-drawings:${username}`;

  async getUserDrawings(
    username: string,
    options?: {
      min?: number;
      max?: number;
    }
  ): Promise<string[]> {
    try {
      const key = this.#userDrawingsKey(username);
      const start = options?.min ?? 0;
      const stop = options?.max ?? -1;
      const data = await this.redis.zRange(key, start, stop, {
        reverse: true,
        by: 'rank',
      });
      if (!data || data === undefined) return [];
      return data.map((value) => value.member);
    } catch (error) {
      if (error) {
        console.error('Error fetching user drawings:', error);
      }
      return [];
    }
  }

  /*
   * Post data
   */
  readonly #postDataKey = (postId: string): string => `post:${postId}`;

  async getPostType(postId: string): Promise<string> {
    const key = this.#postDataKey(postId);
    const postType = await this.redis.hGet(key, 'postType');
    const defaultPostType = 'drawing';
    return postType ?? defaultPostType;
  }

  /*
   * Drawing Post data
   */

  readonly #postSolvedKey = (postId: string): string => `solved:${postId}`;
  readonly #postSkippedKey = (postId: string): string => `skipped:${postId}`;

  async getDrawingPost(postId: string): Promise<DrawingPostData> {
    const postData = await this.redis.hGetAll(this.#postDataKey(postId));
    const solvedCount = await this.redis.zCard(this.#postSolvedKey(postId));
    const skippedCount = await this.redis.zCard(this.#postSkippedKey(postId));
    return {
      postId: postId,
      authorUsername: postData.authorUsername,
      data: JSON.parse(postData.data),
      date: parseInt(postData.date),
      word: postData.word,
      dictionaryName: postData.dictionaryName,
      expired: JSON.parse(postData.expired),
      solves: solvedCount,
      skips: skippedCount,
      postType: postData.postType,
    };
  }

  async getDrawingPosts(postIds: string[]): Promise<Pick<DrawingPostData, 'postId' | 'data'>[]> {
    return await Promise.all(
      postIds.map(async (postId) => {
        const key = this.#postDataKey(postId);
        const stringifiedData = await this.redis.hGet(key, 'data');
        return {
          postId,
          data: stringifiedData ? JSON.parse(stringifiedData) : [],
        };
      })
    );
  }

  async expirePost(postId: string): Promise<void> {
    const key = this.#postDataKey(postId);
    await this.redis.hSet(key, { expired: 'true' });
  }

  async skipPost(postId: string, username: string): Promise<void> {
    const key = this.#postSkippedKey(postId);
    await this.redis.zAdd(key, {
      member: username,
      score: Date.now(),
    });
  }

  // TODO: Move to where it is used
  readonly #wordDrawingsKey = (word: string) => `word-drawings:${word}`;

  async submitDrawing(data: {
    postId: string;
    word: string;
    dictionaryName: string;
    data: number[];
    authorUsername: string;
    subreddit: string;
    flairId: string;
  }): Promise<void> {
    if (!this.scheduler || !this.reddit) {
      console.error('submitDrawing: Scheduler/Reddit API client not available');
      return;
    }
    const key = this.#postDataKey(data.postId);

    // Save post object
    await this.redis.hSet(key, {
      postId: data.postId,
      data: JSON.stringify(data.data),
      authorUsername: data.authorUsername,
      date: Date.now().toString(),
      expired: 'false',
      word: data.word,
      dictionaryName: data.dictionaryName,
      postType: 'drawing',
    });

    // Save the post to the user's drawings
    await this.redis.zAdd(this.#userDrawingsKey(data.authorUsername), {
      member: data.postId,
      score: Date.now(),
    });

    // Save the post to the word's drawings
    await this.redis.zAdd(this.#wordDrawingsKey(data.word), {
      member: data.postId,
      score: Date.now(),
    });

    // Schedule post expiration
    this.scheduler.runJob({
      name: 'PostExpiration',
      data: {
        postId: data.postId,
        answer: data.word,
      },
      runAt: new Date(Date.now() + Settings.postLiveSpan),
    });

    // Schedule a job to pin the TLDR comment
    await this.scheduler.runJob({
      name: 'DRAWING_PINNED_TLDR_COMMENT',
      data: { postId: data.postId },
      runAt: new Date(Date.now()),
    });

    // Give points to the user for posting
    this.incrementUserScore(data.authorUsername, Settings.authorRewardForSubmit);

    this.reddit.setPostFlair({
      subredditName: data.subreddit,
      postId: data.postId,
      flairTemplateId: data.flairId,
    });
  }

  // Game settings
  getGameSettingsKey(): string {
    return 'game-settings';
  }

  async storeGameSettings(settings: { [field: string]: string }): Promise<void> {
    const key = this.getGameSettingsKey();
    await this.redis.hSet(key, settings);
  }

  async getGameSettings(): Promise<GameSettings> {
    const key = this.getGameSettingsKey();
    return (await this.redis.hGetAll(key)) as GameSettings;
  }

  // Dynamic dictionary
  getDictionaryKey(dictionaryName: string): string {
    return `dictionary:${dictionaryName}`;
  }

  /**
   * Saves a list of words to the specified dictionary. If the dictionary does not exist, it will be created.
   *
   * @param dictionaryName The name of the dictionary to save the words to.
   * @param newWords The list of words to save to the dictionary.
   * @returns The number of words that were added to the dictionary.
   */
  async upsertDictionary(
    dictionaryName: string,
    newWords: string[]
  ): Promise<{ rows: number; uniqueNewWords: string[]; duplicatesNotAdded: string[] }> {
    const key = this.getDictionaryKey(dictionaryName);
    const existingJSON = await this.redis.get(key);
    const existingWords = existingJSON ? JSON.parse(existingJSON) : [];

    const uniqueNewWords = newWords.filter((word) => !existingWords.includes(word));
    const duplicatesNotAdded = newWords.filter((word) => existingWords.includes(word));

    const updatedWordsJson = JSON.stringify(Array.from(new Set([...existingWords, ...newWords])));
    await this.redis.set(key, updatedWordsJson);
    return { rows: uniqueNewWords.length, uniqueNewWords, duplicatesNotAdded };
  }

  async removeWordFromDictionary(
    dictionaryName: string,
    wordsToRemove: string[]
  ): Promise<{ removedCount: number; removedWords: string[]; notFoundWords: string[] }> {
    const key = this.getDictionaryKey(dictionaryName);
    const existingJSON = await this.redis.get(key);
    const existingWords: string[] = existingJSON ? JSON.parse(existingJSON) : [];
    const updatedWords = existingWords.filter((word) => !wordsToRemove.includes(word));

    const removedCount = existingWords.length - updatedWords.length;
    const removedWords = wordsToRemove.filter((word) => existingWords.includes(word));
    const notFoundWords = wordsToRemove.filter((word) => !removedWords.includes(word));

    const updatedWordsJson = JSON.stringify(updatedWords);
    await this.redis.set(key, updatedWordsJson);

    return { removedCount, removedWords, notFoundWords };
  }

  async getActiveDictionaries(): Promise<Dictionary[]> {
    // Determine which dictionaries to fetch
    const gameSettings = await this.getGameSettings();
    const defaultDictionary = 'main';
    const dictionaries = [gameSettings.selectedDictionary];
    if (gameSettings.selectedDictionary !== defaultDictionary) {
      dictionaries.push(defaultDictionary);
    }

    // Fetch and parse the dictionaries
    return await Promise.all(
      dictionaries.map(async (dictionaryName) => {
        const key = this.getDictionaryKey(dictionaryName);
        const dictionaryJsonString = await this.redis.get(key);
        const parsedDictionary: string[] = dictionaryJsonString
          ? JSON.parse(dictionaryJsonString)
          : [];
        return {
          name: dictionaryName,
          words: parsedDictionary,
        };
      })
    );
  }

  async selectDictionary(dictionaryName: string): Promise<void> {
    const gameSettings = await this.getGameSettings();
    gameSettings.selectedDictionary = dictionaryName;
    await this.storeGameSettings(gameSettings);
  }

  async logDictionary(dictionaryName: string): Promise<void> {
    const data = await this.redis.get(this.getDictionaryKey(dictionaryName));
    console.log('Dictionary: ', data);
  }

  /*
   * Collections
   */

  async getPostDataFromSubredditPosts(posts: Post[], limit: number): Promise<CollectionData[]> {
    return await Promise.all(
      posts.map(async (post: Post) => {
        const postType = await this.getPostType(post.id);
        if (postType === 'drawing') {
          return await this.getDrawingPost(post.id);
        }
        return null;
      })
    ).then((results) =>
      results.filter((postData): postData is DrawingPostData => postData !== null).slice(0, limit)
    );
  }

  async storeCollectionPostData(data: {
    postId: string;
    data: CollectionData[];
    timeframe: string;
    postType: string;
  }): Promise<void> {
    const key = this.#postDataKey(data.postId);
    await this.redis.hSet(key, {
      postId: data.postId,
      data: JSON.stringify(data.data),
      timeframe: data.timeframe,
      postType: data.postType,
    });
  }

  async getCollectionPost(postId: string): Promise<CollectionPostData> {
    const key = this.#postDataKey(postId);
    const post = await this.redis.hGetAll(key);
    return {
      postId: post.postId,
      postType: 'collection',
      data: JSON.parse(post.data),
      timeframe: post.timeframe,
    };
  }

  /*
   * Pinned Post
   */

  async savePinnedPost(postId: string): Promise<void> {
    const key = this.#postDataKey(postId);
    await this.redis.hSet(key, {
      postId: postId,
      postType: 'pinned',
    });
  }

  async getPinnedPost(postId: string): Promise<PinnedPostData> {
    const key = this.#postDataKey(postId);
    const postType = await this.redis.hGet(key, 'postType');
    return {
      postId: postId,
      postType: postType ?? 'pinned',
    };
  }

  /*
   * User Data and State Persistence
   */

  readonly #userDataKey = (username: string) => `users:${username}`;

  async saveUserData(
    username: string,
    data: { [field: string]: string | number | boolean }
  ): Promise<void> {
    const key = this.#userDataKey(username);
    const stringConfig = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, String(value)])
    );
    await this.redis.hSet(key, stringConfig);
  }

  async getUser(username: string, postId: string): Promise<UserData> {
    const data = await this.redis.hGetAll(this.#userDataKey(username));
    const solved = !!(await this.redis.zScore(this.#postSolvedKey(postId), username));
    const skipped = !!(await this.redis.zScore(this.#postSkippedKey(postId), username));

    const user = await this.getUserScore(username);
    const level = getLevelByScore(user.score);
    const parsedData: UserData = {
      score: user.score,
      levelRank: data.levelRank ? parseInt(data.levelRank) : level.rank,
      levelName: data.levelName ?? level.name,
      solved,
      skipped,
    };
    return parsedData;
  }
}
