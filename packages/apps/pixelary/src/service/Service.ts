import type {
  Comment,
  Post,
  RedditAPIClient,
  RedisClient,
  Scheduler,
  ZMember,
  ZRangeOptions,
} from '@devvit/public-api';

import Words from '../data/words.json';
import Settings from '../settings.json';
import type { GameSettings } from '../types/GameSettings.js';
import type { CollectionData, CollectionPostData, PostData } from '../types/PostData.js';
import type { ScoreBoardEntry } from '../types/ScoreBoardEntry.js';

// Service that handles the backbone logic for the application
// This service is responsible for:
// * Storing and fetching post data for drawings
// * Storing and fetching the score board
// * Storing and fetching user settings
// * Storing and fetching game settings
// * Storing and fetching dynamic dictionaries

export const selectedDictionaryKey = 'selectedDictionary';

export class Service {
  readonly redis: RedisClient;
  readonly reddit?: RedditAPIClient;
  readonly scheduler?: Scheduler;
  static readonly scoreWindow = 60 * 60 * 24 * 7; // 1 week

  constructor(context: { redis: RedisClient; reddit?: RedditAPIClient; scheduler?: Scheduler }) {
    this.redis = context.redis;
    this.reddit = context.reddit;
    this.scheduler = context.scheduler;
  }

  /*
   * Handle Guess Event
   */

  async handleGuessEvent(event: {
    postData: PostData;
    username: string;
    guess: string;
    createComment: boolean;
  }): Promise<void> {
    if (!this.reddit || !this.scheduler) {
      console.error('Reddit API client or Scheduler not available in Service');
      return;
    }

    // Comment guess if user is the first to make it
    const isGuessUnique = !event.postData.guesses.some((guess) => guess.word === event.guess);
    let comment: Comment | undefined;
    try {
      if (event.createComment && isGuessUnique) {
        comment = await this.reddit.submitComment({
          id: event.postData.postId,
          text: `I tried **${event.guess}**`,
        });
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
      comment = undefined;
    }

    // Save data to Redis
    const pointsPerGuess = Settings.pointsPerGuess;
    const isGuessCorrect = event.postData.word.toLowerCase() === event.guess.toLowerCase();
    const [
      _saveUserEvent,
      _saveAuthorEvent,
      _userPoints,
      _userGuesses,
      wordGuesses,
      _drawerPoints,
      _guessComment,
    ] = await Promise.all([
      // Save score board event. Not sure we need this anymore.
      isGuessCorrect &&
        this.#saveScoreBoardEvent({
          username: event.username,
          postId: event.postData.postId,
          points: pointsPerGuess,
        }),
      //Update score for drawing author if it was the first time being solved
      isGuessCorrect &&
        this.#saveScoreBoardEvent({
          username: event.postData.authorUsername,
          points: pointsPerGuess,
          postId: event.postData.postId,
        }),
      // Update user points
      isGuessCorrect &&
        this.redis.hIncrBy(
          this.getPostDataKey(event.postData.postId),
          `user:${event.username}:points`,
          pointsPerGuess
        ),
      // Increment the number of guesses this user has made on this post
      this.redis.hIncrBy(
        this.getPostDataKey(event.postData.postId),
        `user:${event.username}:guesses`,
        1
      ),
      // Increment number of times this word has been guessed
      this.redis.hIncrBy(
        this.getPostDataKey(event.postData.postId),
        `guess:${event.guess.toLowerCase()}`,
        1
      ),
      // Update drawer points
      isGuessCorrect &&
        this.redis.hIncrBy(
          this.getPostDataKey(event.postData.postId),
          `user:${event.postData.authorUsername}:points`,
          pointsPerGuess
        ),
      // Save guess comment
      event.createComment &&
        comment &&
        this.redis.hSet(this.getPostDataKey(event.postData.postId), {
          [this.guessCommentField(event.guess)]: comment.id,
        }),
    ]);

    // Submit a comment if the user is the first to solve the drawing
    const isFirstToGuessWord = wordGuesses === 1;
    if (isFirstToGuessWord && isGuessCorrect) {
      await this.scheduler.runJob({
        name: 'FIRST_SOLVER_COMMENT',
        data: {
          postId: event.postData.postId,
          username: event.username,
        },
        runAt: new Date(),
      });
    }
  }

  guessCommentField(word: string): string {
    return `guess-comment:${word.toLowerCase()}`;
  }

  async removeGuessComment(postId: string, word: string, commentId: string): Promise<void> {
    await this.redis.hDel(this.getPostDataKey(postId), [this.guessCommentField(word)]);
  }

  // Saving score board events
  readonly #scoreBoardEventsKey: string = 'solvedDrawingsEvents';

  #scoreBoardEventField(drawingId: string, username: string): string {
    return `${username}:${drawingId}`;
  }

  async #saveScoreBoardEvent(event: {
    username: string;
    postId: string;
    points: number;
  }): Promise<void> {
    const { postId, username } = event;
    const key = this.#scoreBoardEventsKey;
    await this.redis.hset(key, {
      [this.#scoreBoardEventField(postId, username)]: JSON.stringify(event),
    });
    await this.redis.expire(key, Service.scoreWindow);
  }

  // Fetching and storing the score board
  readonly #scoreBoardKey: string = 'scoreBoard';

  async getScoreBoard(maxLength: number): Promise<ScoreBoardEntry[]> {
    const options: ZRangeOptions = { reverse: true, by: 'rank' };
    return await this.redis.zRange(this.#scoreBoardKey, 0, maxLength - 1, options);
  }

  async updateScoreBoard(): Promise<void> {
    try {
      const scoreEvents = await this.redis.hgetall(this.#scoreBoardEventsKey);

      if (!scoreEvents) {
        return;
      }

      const parsedScoreEvents = Object.values(scoreEvents).map((value) => JSON.parse(value));

      // Tally up all the scores in a scoreMap
      const scoreMap: {
        [username: string]: number;
      } = {};
      parsedScoreEvents.forEach((event) => {
        const { username, points } = event;
        scoreMap[username] = (scoreMap[username] ?? 0) + points;
      });

      // Convert scoreMap to ZMember[]
      const scores: ZMember[] = Object.entries(scoreMap).map(([username, points]) => ({
        member: username,
        score: points,
      }));

      // Update score board
      await this.redis.zRemRangeByRank(this.#scoreBoardKey, 0, -1);
      await this.redis.zAdd(this.#scoreBoardKey, ...scores);
      console.log('Updated the score board.');
    } catch (error) {
      // console.error('Error updating score board', error);
    }
  }

  // Clear score board events
  async clearScoreBoard(): Promise<void> {
    try {
      await this.redis.del(this.#scoreBoardEventsKey);
    } catch (error) {
      console.error('Error clearing score board events', error);
    }
  }

  // Fetching user rank and score
  async getScoreBoardUserEntry(username: string | null): Promise<{
    rank: number;
    score: number;
  }> {
    if (username === null)
      return {
        rank: -1,
        score: 0,
      };

    try {
      const [rank, score] = await Promise.all([
        this.redis.zRank(this.#scoreBoardKey, username),
        this.redis.zScore(this.#scoreBoardKey, username),
      ]);
      return {
        rank: isNaN(rank) ? -1 : rank,
        score: isNaN(score) ? 0 : score,
      };
    } catch (error) {
      // console.error('Error fetching user score board entry', error);
      return {
        rank: -1,
        score: 0,
      };
    }
  }

  // Incorrect guesses
  // Save incorrect guesses that are not already part of the word list
  // so that they could be used to expande the word list in the future.

  getCapitalizedWord(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  readonly #incorrectGuessesKey: string = 'incorrectGuesses';
  async saveIncorrectGuess(word: string): Promise<void> {
    if (Words.includes(this.getCapitalizedWord(word))) {
      return;
    }
    try {
      await this.redis.hset(this.#incorrectGuessesKey, {
        [word]: '',
      });
    } catch (error) {
      throw new Error('Error saving incorrect guess');
    }
  }

  async getIncorrectGuesses(): Promise<string[]> {
    try {
      return await this.redis.hkeys(this.#incorrectGuessesKey);
    } catch (error) {
      throw new Error('Error fetching incorrect guesses');
    }
  }

  async deleteIncorrectGuesses(): Promise<void> {
    try {
      await this.redis.del(this.#incorrectGuessesKey);
    } catch (error) {
      throw new Error('Error deleting incorrect guesses');
    }
  }

  /*
   * My Drawings
   *
   * All shared drawings are stored in a sorted set for each player:
   * - Member: Stringified post data
   * - Score: Unix epoch time
   */

  getMyDrawingsKey(username: string): string {
    return `my-drawings:${username}}`;
  }

  async storeMyDrawing(postData: PostData): Promise<void> {
    const key = this.getMyDrawingsKey(postData.authorUsername);
    await this.redis.zAdd(key, {
      member: JSON.stringify(postData),
      score: Date.now(),
    });
  }

  async getMyDrawings(
    username: string | null,
    min: number = 0,
    max: number = -1
  ): Promise<PostData[]> {
    if (!username) return [];
    const key = this.getMyDrawingsKey(username);
    const data = await this.redis.zRange(key, min, max, {
      reverse: true,
      by: 'rank',
    });
    if (!data || data === undefined) return [];
    return data.map((value) => JSON.parse(value.member)) as PostData[];
  }

  /*
   * Post data
   */

  getPostDataKey(postId: string): string {
    return `post-${postId}`;
  }

  parsePostData(data: Record<string, string>, username: string | null): PostData {
    const response: PostData = {
      postId: data.postId ? data.postId : '',
      authorUsername: data.authorUsername ? data.authorUsername : '',
      data: data.data ? JSON.parse(data.data) : [],
      date: data.date ? parseInt(data.date) : 0,
      word: data.word ? data.word : '',
      expired: data.expired ? JSON.parse(data.expired) : false,
      count: {
        players: 0,
        winners: data[`guess:${data.word?.toLowerCase()}`]
          ? parseInt(data[`guess:${data.word?.toLowerCase()}`])
          : 0,
        guesses: 0,
        words: 0,
        skipped: 0,
      },
      user: {
        guesses: 0,
        points: 0,
        solved: false,
        skipped: false,
      },
      guesses: [],
      postType: 'drawing',
    };

    // Check if the post has expired
    if (data?.expired) {
      response.expired = data.expired === 'true';
    }

    if (username) {
      // Tally how many times the user has guessed
      const userGuessCountKey = `user:${username}:guesses`;
      if (data?.[userGuessCountKey]) {
        response.user.guesses = parseInt(data[userGuessCountKey]);
      }

      // Check if the user has solved the post
      const userPointsEarnedKey = `user:${username}:points`;
      if (data?.[userPointsEarnedKey]) {
        response.user.solved = true;
        response.user.points = parseInt(data[userPointsEarnedKey]);
      }

      // Check if the user has skipped the post
      if (data?.[this.userSkippedField(username)]) {
        response.user.skipped = true;
      }
    }

    if (data) {
      // Parse the guess comments
      const comments: { [key: string]: string } = {};
      Object.keys(data ?? {})
        .filter((key) => key.startsWith('guess-comment:'))
        .map((key) => {
          const [_, word] = key.split(':');
          comments[word] = data[key];
        });

      // Parse the guesses
      const guesses = Object.keys(data).filter((key) => key.startsWith('guess:'));
      if (guesses.length > 0) {
        guesses.forEach((key) => {
          const word = key.split(':')[1];
          const count = parseInt(data[key]);
          response.count.guesses += count;
          response.count.words += 1;
          response.guesses.push({ word, count, commentId: comments[word] ?? '' });
          if (word === response.word) {
            response.count.winners = count;
          }
        });
      }

      // Count how many players gave up
      const skippedPlayers = Object.keys(data).filter(
        (key) => key.startsWith('user:') && key.endsWith(':skipped')
      );
      response.count.skipped = skippedPlayers.length;

      // Count how many players have guessed
      const playerGuesses = Object.keys(data).filter(
        (key) => key.startsWith('user:') && key.endsWith(':guesses')
      );
      response.count.players = playerGuesses.length;
    }

    // Return the parsed post data
    return response;
  }

  async expirePost(postId: string): Promise<void> {
    const key = this.getPostDataKey(postId);
    await this.redis.hSet(key, { expired: 'true' });
  }

  userSkippedField(username: string): string {
    return `user:${username}:skipped`;
  }

  async skipPost(postId: string, username: string): Promise<void> {
    await this.redis.hSet(this.getPostDataKey(postId), {
      [this.userSkippedField(username)]: 'true',
    });
  }

  async getPostData(postId: string): Promise<Record<string, string>> {
    const key = this.getPostDataKey(postId);
    const postData = await this.redis.hGetAll(key);
    // Ensure the postId is set, even if postData is empty
    return postData?.postId ? postData : { postId };
  }

  async storePostData(data: {
    postId: string;
    word: string;
    data: number[];
    authorUsername: string;
  }): Promise<void> {
    const key = this.getPostDataKey(data.postId);
    await this.redis.hSet(key, {
      postId: data.postId,
      data: JSON.stringify(data.data),
      authorUsername: data.authorUsername,
      date: Date.now().toString(),
      expired: 'false',
      word: data.word,
    });
  }

  // Game settings
  getGameSettingsKey(): string {
    return 'game-settings';
  }

  async storeGameSettings(settings: GameSettings): Promise<void> {
    const key = this.getGameSettingsKey();
    await this.redis.hset(key, settings);
  }

  async getGameSettings(): Promise<GameSettings> {
    const key = this.getGameSettingsKey();
    return (await this.redis.hgetall(key)) as GameSettings;
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
  async upsertDictionary(dictionaryName: string, newWords: string[]): Promise<{ rows: number }> {
    const key = this.getDictionaryKey(dictionaryName);
    const existingJSON = await this.redis.get(key);
    const existingWords = existingJSON ? JSON.parse(existingJSON) : [];

    const uniqueNewWords = newWords.filter((word) => !existingWords.includes(word));
    if (uniqueNewWords.length === 0) {
      return { rows: 0 };
    }

    const updatedWordsJson = JSON.stringify(Array.from(new Set([...existingWords, ...newWords])));
    await this.redis.set(key, updatedWordsJson);
    return { rows: uniqueNewWords.length };
  }

  async getDictionary(printToLogs: boolean): Promise<string[]> {
    const selectedDictionary = await this.getSelectedDictionaryName();
    const key = this.getDictionaryKey(selectedDictionary);
    const dictionaryJsonString = await this.redis.get(key);
    const parsedDictionary = dictionaryJsonString ? JSON.parse(dictionaryJsonString) : [];

    if (printToLogs) {
      console.log(`${key}:`, parsedDictionary);
    }

    return parsedDictionary;
  }

  async setSelectedDictionaryName(dictionaryName: string): Promise<void> {
    await this.redis.set(selectedDictionaryKey, dictionaryName);
  }

  async getSelectedDictionaryName(): Promise<string> {
    const selectedDictionary = await this.redis.get(selectedDictionaryKey);
    return selectedDictionary ?? 'main';
  }

  /*
   * Collections
   */

  async getPostDataFromSubredditPosts(posts: Post[], limit: number): Promise<CollectionData[]> {
    return await Promise.all(
      posts.map(async (post: Post) => {
        const postData = await this.getPostData(post.id);
        if (postData?.word) {
          return {
            postId: postData.postId,
            data: JSON.parse(postData.data),
            authorUsername: postData.authorUsername,
          };
        }
        return null;
      })
    ).then((results) =>
      results.filter((postData): postData is PostData => postData !== null).slice(0, limit)
    );
  }

  async storeCollectionPostData(data: {
    postId: string;
    data: CollectionData[];
    timeframe: string;
    postType: string;
  }): Promise<void> {
    const key = this.getPostDataKey(data.postId);
    await this.redis.hSet(key, {
      postId: data.postId,
      data: JSON.stringify(data.data),
      timeframe: data.timeframe,
      postType: data.postType,
    });
  }

  parseCollectionPostData(rawData: Record<string, string>): CollectionPostData {
    return {
      postId: rawData.postId,
      postType: 'collection',
      data: JSON.parse(rawData.data),
      timeframe: rawData.timeframe,
    };
  }
}
