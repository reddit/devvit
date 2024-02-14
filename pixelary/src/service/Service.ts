import { RedisClient, User, ZRangeOptions } from '@devvit/public-api';
import Settings from '../settings.json';
import Words from '../data/words.json';
import { getScoreMultiplier } from '../utils/getScoreMultiplier.js';
import { LeaderboardEntry } from '../types/LeaderboardEntry.js';
import { DailyDrawingRecord } from '../types/DailyDrawingRecord.js';
import { UserSettings } from '../types/UserSettings.js';

// Service that handles the backbone logic for the application
// This service is responsible for:
// * Storing and fetching drawing data
// * Storing and fetching solved drawing events
// * Storing and fetching user settings

export class Service {
  readonly redis: RedisClient;
  static readonly scoreWindow = 60 * 60 * 24 * 7; // 1 week

  constructor(redis: RedisClient) {
    this.redis = redis;
  }

  // Methods that handles DB updates on drawing solving event
  // Returns true if drawing was not solved before
  async handleDrawingSolvedEvent(
    drawingId: string,
    drawingAuthorName: string,
    userId: string,
    userName: string,
    drawingDate: Date
  ): Promise<boolean> {
    // count points
    const points = Settings.guesserPoints * getScoreMultiplier(drawingDate);

    const result = await Promise.all([
      // save event
      this.saveSolvedDrawingEvent(drawingId, userId, points),
      // save points for guesser
      this.updateScoreBoard(userName, points),

      this.getIsDrawingSolved(drawingId).then(async (isSolvedBefore) => {
        if (!isSolvedBefore) {
          console.log('Saving solved drawing and drawer points');
          await Promise.all([
            // save solved drawing
            this.saveSolvedDrawing(drawingId),
            // save points for drawer
            this.updateScoreBoard(drawingAuthorName, Settings.drawerPoints),
          ]);
        }
        return !isSolvedBefore;
      }),
    ]);
    return result[2];
  }

  //Fetching and saving solved posts
  private readonly solvedDrawingsKey: string = 'solvedDrawings';
  async saveSolvedDrawing(drawingId: string): Promise<void> {
    const date = new Date();
    await this.redis.hset(this.solvedDrawingsKey, {
      [drawingId]: date.toString(),
    });
  }

  async getIsDrawingSolved(drawingId: string): Promise<boolean> {
    const solvedDrawing = await this.redis.hget(this.solvedDrawingsKey, drawingId);
    return !!solvedDrawing;
  }

  // Fetching and saving solved drawing events
  private readonly solvedDrawingsEventsKey: string = 'solvedDrawingsEvents';
  // private eventKey(date: number): string {
  //   return `${this.solvedDrawingsEventsKey}:${date}`;
  // }
  private eventField(drawingId: string, userId: string): string {
    return `${userId}:${drawingId}`;
  }

  async saveSolvedDrawingEvent(drawingId: string, userId: string, points: number): Promise<void> {
    const solvedDrawingEvent = {
      drawingId,
      userId,
      points,
      date: new Date(),
    };
    const key = this.solvedDrawingsEventsKey;
    await this.redis.hset(key, {
      [this.eventField(drawingId, userId)]: JSON.stringify(solvedDrawingEvent),
    });
    // await this.redis.expire(key, Service.scoreWindow);
  }

  // Todo: Dedupe this from the method below (getIsDrawingSolvedByUser)
  async getPointsEarnedByUser(drawingId: string, userId: string): Promise<number> {
    const key = this.solvedDrawingsEventsKey;
    const event = await this.redis.hget(key, this.eventField(drawingId, userId));
    if (event) {
      const parsedEvent = JSON.parse(event!);
      return parsedEvent.points;
    }
    return 0;
  }

  async getIsDrawingSolvedByUser(drawingId: string, userId: string): Promise<boolean> {
    const key = this.solvedDrawingsEventsKey;
    const event = await this.redis.hget(key, this.eventField(drawingId, userId));
    return !!event;
  }

  private readonly scoreBoardKey: string = 'scoreBoard';
  async updateScoreBoard(userName: string, points: number): Promise<void> {
    await this.redis
      .zScore(this.scoreBoardKey, userName)
      .then(async (score) => {
        // user's score can be null when scoreboard key doesn't exist
        if (score) {
          console.log(
            'Update ScoreBoard for %s => %d + %d = %d',
            userName,
            score,
            points,
            score + points
          );
          await this.redis.zAdd(this.scoreBoardKey, {
            member: userName,
            score: score + points,
          });
        }
      })
      .catch(async (err) => {
        console.log('Error: %s', err);
        console.log('Update ScoreBoard for %s => %d + %d = %d', userName, 0, points, points);
        await this.redis.zAdd(this.scoreBoardKey, {
          member: userName,
          score: points,
        });
      });
    // HACK: TODO: Schedule revert of update after rolling window
  }

  // Fetching score board results
  async getScoreBoard(maxLength: number): Promise<LeaderboardEntry[]> {
    const options: ZRangeOptions = { reverse: true, by: 'rank' };
    return await this.redis.zRange(this.scoreBoardKey, 0, maxLength - 1, options);
  }

  async getUserPoints(userName: string): Promise<number> {
    try {
      // user's score can be null when scoreboard key doesn't exist
      return (await this.redis.zScore(this.scoreBoardKey, userName)) ?? 0;
    } catch (error) {
      return 0;
    }
  }
  // private readonly scoreBoardKey: string = 'scoreBoard';
  // async updateScoreBoard(): Promise<void> {
  // }

  private readonly incorrectGuessesKey: string = 'incorrectGuesses';

  // Save incorrect guesses that are not already part of the word list
  // so that they could be used to expande the word list in the future.
  saveIncorrectGuess(word: string): void {
    const capitalizedWord = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    if (Words.includes(capitalizedWord)) {
      return;
    }
    try {
      this.redis.hset(this.incorrectGuessesKey, {
        [word]: '',
      });
    } catch (error) {
      console.error('Error saving incorrect guess', error);
    }
  }

  async getIncorrectGuesses(): Promise<string[]> {
    try {
      return await this.redis.hkeys(this.incorrectGuessesKey);
    } catch (error) {
      console.error('Error fetching incorrect guesses', error);
      return [];
    }
  }

  deleteIncorrectGuesses(): void {
    try {
      this.redis.del(this.incorrectGuessesKey);
    } catch (error) {
      console.error('Error deleting incorrect guesses', error);
    }
  }

  getDailyDrawingsKey(userId: string): string {
    const today = new Date();
    const dateStamp = today.toISOString().split('T')[0];
    return `${userId}-${dateStamp}`;
  }

  storeDrawing(key: string, drawings: DailyDrawingRecord[]): void {
    this.redis.set(key, JSON.stringify(drawings));
    this.redis.expire(key, Settings.dailyDrawingsExpiration);
  }

  // User settings
  getUserSettingsKey(userId: string): string {
    return `${userId}-settings`;
  }

  async getUserSettings(userId: string): Promise<UserSettings> {
    const key = this.getUserSettingsKey(userId);
    const data = await this.redis.get(key);
    if (!data) {
      return {
        drawingGuessed: true,
      };
    }
    return JSON.parse(data);
  }

  async saveUserSettings(userId: string, settings: UserSettings): Promise<void> {
    const key = this.getUserSettingsKey(userId);
    await this.redis.set(key, JSON.stringify(settings));
  }

  // DEBUG
  async resetSolvedDrawings(): Promise<void> {
    await Promise.all([
      this.redis.del(this.solvedDrawingsEventsKey),
      this.redis.del(this.solvedDrawingsKey),
    ]);
  }
}
