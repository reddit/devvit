import type { RedisClient, ZMember, ZRangeOptions } from '@devvit/public-api';
import Settings from '../settings.json';
import Words from '../data/words.json';
import type { ScoreBoardEntry } from '../types/ScoreBoardEntry.js';
import type { GameSettings } from '../types/GameSettings.js';
import type { PostData } from '../types/PostData.js';

// Service that handles the backbone logic for the application
// This service is responsible for:
// * Storing and fetching post data for drawings
// * Storing and fetching the score board
// * Storing and fetching user settings
// * Storing and fetching game settings

export class Service {
  readonly redis: RedisClient;
  static readonly scoreWindow = 60 * 60 * 24 * 7; // 1 week

  constructor(redis: RedisClient) {
    this.redis = redis;
  }

  // Methods that handles DB updates on drawing solving event
  // Returns true if drawing was not solved before
  async handleGuessEvent(event: {
    postId: string;
    authorUsername: string;
    username: string;
    word: string;
    guess: string;
  }): Promise<boolean> {
    const pointsPerGuess = Settings.pointsPerGuess;
    const correctGuess = event.guess.toLowerCase() === event.word.toLowerCase();
    const [
      _saveUserEvent,
      _saveAuthorEvent,
      _userPoints,
      _userGuesses,
      wordGuesses,
      _drawerPoints,
    ] = await Promise.all([
      // Save score board event. Not sure we need this anymore.
      correctGuess &&
        this.#saveScoreBoardEvent({
          username: event.username,
          postId: event.postId,
          points: pointsPerGuess,
        }),
      //Update score for drawing author if it was the first time being solved
      correctGuess &&
        this.#saveScoreBoardEvent({
          username: event.authorUsername,
          points: pointsPerGuess,
          postId: event.postId,
        }),
      // Update user points
      correctGuess &&
        this.redis.hIncrBy(
          this.getPostDataKey(event.postId),
          `user:${event.username}:points`,
          pointsPerGuess
        ),
      // Increment the number of guesses this user has made on this post
      this.redis.hIncrBy(this.getPostDataKey(event.postId), `user:${event.username}:guesses`, 1),
      // Increment number of times this word has been guessed
      this.redis.hIncrBy(
        this.getPostDataKey(event.postId),
        `guess:${event.guess.toLowerCase()}`,
        1
      ),
      // Update drawer points
      correctGuess &&
        this.redis.hIncrBy(
          this.getPostDataKey(event.postId),
          `user:${event.authorUsername}:points`,
          pointsPerGuess
        ),
    ]);

    return correctGuess && wordGuesses === 1;
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

  readonly #incorrectGuessesKey: string = 'incorrectGuesses';
  async saveIncorrectGuess(word: string): Promise<void> {
    const capitalizedWord = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    if (Words.includes(capitalizedWord)) {
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

  parsePostData(data: Record<string, string> | undefined, username: string | null): PostData {
    const response: PostData = {
      postId: data?.postId ? data.postId : '',
      authorUsername: data?.authorUsername ? data.authorUsername : '',
      data: data?.data ? JSON.parse(data.data) : [],
      date: data?.date ? parseInt(data.date) : 0,
      word: data?.word ? data.word : '',
      expired: data?.expired ? JSON.parse(data.expired) : false,
      count: {
        players: 0,
        winners: data?.[`guess:${data.word.toLowerCase()}`]
          ? parseInt(data[`guess:${data.word.toLowerCase()}`])
          : 0,
        guesses: 0,
        words: 0,
      },
      user: {
        guesses: 0,
        points: 0,
        solved: false,
      },
      guesses: [],
    };

    // Check if the post has expired
    if (data?.expired) {
      response.expired = data.expired === 'true';
    }

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

    if (data) {
      const guesses = Object.keys(data).filter((key) => key.startsWith('guess:'));
      if (guesses.length > 0) {
        guesses.forEach((key) => {
          const word = key.split(':')[1];
          const count = parseInt(data[key]);
          response.count.guesses += count;
          response.count.words += 1;
          response.guesses.push({ word, count });
          if (word === response.word) {
            response.count.winners = count;
          }
        });
      }
    }

    // Count how many players have guessed
    const playerGuesses = Object.keys(data || {}).filter(
      (key) => key.startsWith('user:') && key.endsWith(':guesses')
    );
    response.count.players = playerGuesses.length;

    // Return the parsed post data
    return response;
  }

  async expirePost(postId: string): Promise<void> {
    const key = this.getPostDataKey(postId);
    await this.redis.hSet(key, { expired: 'true' });
  }

  async getPostData(postId: string): Promise<Record<string, string> | undefined> {
    const key = this.getPostDataKey(postId);
    return await this.redis.hGetAll(key);
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
}
