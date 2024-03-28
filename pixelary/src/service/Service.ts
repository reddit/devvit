import type { RedisClient, ZMember, ZRangeOptions } from '@devvit/public-api';
import Settings from '../settings.json';
import Words from '../data/words.json';
import { getScoreMultiplier } from '../utils/getScoreMultiplier.js';
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
  async handleDrawingSolvedEvent(
    postId: string,
    drawingAuthorName: string,
    username: string,
    drawingDate: number,
    isSolved: boolean
  ): Promise<boolean> {
    // Determine how many points the user gets
    const points = Settings.guesserPoints * getScoreMultiplier(drawingDate);

    await Promise.all([
      // Save score board event
      this.#saveScoreBoardEvent({
        username,
        postId: postId,
        points,
      }),
      // Save that the drawing was solved
      this.storePostData({
        postId: postId,
        solved: true,
        pointsEarnedByUser: points,
        username,
      }),
      // Update score for drawing author if it was the first time being solved
      !isSolved &&
        this.#saveScoreBoardEvent({
          username: drawingAuthorName,
          points: Settings.drawerPoints,
          postId: postId,
        }),
    ]);

    return !isSolved;
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
      // console.log('Updated the score board.');
    } catch (error) {
      // console.error('Error updating score board', error);
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
      console.error('Error saving incorrect guess', error);
    }
  }

  async getIncorrectGuesses(): Promise<string[]> {
    try {
      return await this.redis.hkeys(this.#incorrectGuessesKey);
    } catch (error) {
      console.error('Error fetching incorrect guesses', error);
      return [];
    }
  }

  async deleteIncorrectGuesses(): Promise<void> {
    try {
      await this.redis.del(this.#incorrectGuessesKey);
    } catch (error) {
      console.error('Error deleting incorrect guesses', error);
    }
  }

  // Daily drawings
  getDailyDrawingsKey(username: string): string {
    const today = new Date();
    const dateStamp = today.toISOString().split('T')[0];
    return `daily-drawings:${username}:${dateStamp}`;
  }

  async storeDailyDrawing(postData: PostData): Promise<void> {
    const key = this.getDailyDrawingsKey(postData.authorUsername);
    const field = new Date().toISOString();
    await this.redis.hset(key, {
      [field]: JSON.stringify(postData),
    });
    await this.redis.expire(key, Settings.dailyDrawingsExpiration);
  }

  async getDailyDrawings(username: string | null): Promise<PostData[]> {
    if (!username) {
      return [];
    }

    const key = this.getDailyDrawingsKey(username);
    const data = await this.redis.hgetall(key);

    if (!data || data === undefined) {
      return [];
    }

    const keys = Object.keys(data);
    const output: PostData[] = [];

    keys.forEach((value: string) => {
      const valueParsed = JSON.parse(data![value]) as PostData;
      output.push(valueParsed);
    });

    return output;
  }

  async getDailyDrawingsLeft(username: string | null): Promise<number> {
    const defaultValue = Settings.dailyDrawingsQuota;
    if (!username) {
      return defaultValue;
    }
    try {
      const key = this.getDailyDrawingsKey(username);
      const data = await this.redis.hkeys(key);
      if (!data) {
        return defaultValue;
      }
      return defaultValue - data.length;
    } catch (error) {
      throw new Error('Error getting daily drawings left');
    }
  }

  // Post data
  getPostDataKey(postId: string): string {
    return `post-${postId}`;
  }

  async getPostData(postId: string, username: string | null): Promise<PostData | undefined> {
    const key = this.getPostDataKey(postId);
    // TODO: Swap out with HMGET and a list of fields when supported
    const data = await this.redis.hgetall(key);

    if (!data || !data.postId) {
      return undefined;
    }

    const response: PostData = {
      postId: postId,
      authorUsername: data.authorUsername,
      data: JSON.parse(data.data),
      date: parseInt(data.date),
      word: data.word,
      published: true,
    };

    if (data.expired) {
      response.expired = data.expired === 'true';
    }
    if (data.solved) {
      response.solved = data.solved === 'true';
    }

    const pointsEarnedByUserKey = `pointsEarnedBy:${username}`;
    if (data[pointsEarnedByUserKey]) {
      response.pointsEarnedByUser = parseInt(data[pointsEarnedByUserKey]);
    }

    return response;
  }

  async storePostData(data: {
    postId: string;
    word?: string;
    data?: number[];
    authorUsername?: string;
    date?: number;
    expired?: boolean;
    solved?: boolean;
    pointsEarnedByUser?: number;
    username?: string;
  }): Promise<void> {
    const hashData: Record<string, string> = {
      postId: data.postId,
    };

    if (data.word) {
      hashData.word = data.word;
    }
    if (data.data) {
      hashData.data = JSON.stringify(data.data);
    }
    if (data.authorUsername) {
      hashData.authorUsername = data.authorUsername;
    }
    if (data.date) {
      hashData.date = JSON.stringify(data.date);
    }
    if (data.expired) {
      hashData.expired = JSON.stringify(data.expired);
    }
    if (data.solved) {
      hashData.solved = JSON.stringify(data.solved);
    }
    if (data.pointsEarnedByUser) {
      const pointsEarnedByUserKey = `pointsEarnedBy:${data.username}`;
      hashData[pointsEarnedByUserKey] = JSON.stringify(data.pointsEarnedByUser);
    }

    const key = this.getPostDataKey(data.postId);
    await this.redis.hset(key, hashData);
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
