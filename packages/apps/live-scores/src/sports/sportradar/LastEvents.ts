import { NFLBoxscoreLastEvent } from './NFLBoxscore.js';
import { RedisClient } from '@devvit/public-api';

function eventIdsKey(gameId: string): string {
  return `${gameId}:eventIds`;
}

function eventKey(gameId: string, eventId: string): string {
  return `${gameId}:events:${eventId}`;
}

export async function getAllEventIds(
  redis: RedisClient,
  gameId: string | undefined
): Promise<string[]> {
  if (!gameId) {
    throw new Error('Undefined postId in getAllEventIds');
  }
  const key = eventIdsKey(gameId);
  const existingEvents = await redis.get(key);
  return existingEvents ? JSON.parse(existingEvents) : [];
}

export async function storeLastEvent(
  lastEvent: NFLBoxscoreLastEvent,
  redis: RedisClient,
  gameId: string
): Promise<void> {
  const events = await getAllEventIds(redis, gameId);
  if (events.find((eventId: String) => eventId === lastEvent.id)) {
    // Do not store, already exists
    return;
  }
  events.push(lastEvent.id);
  const updatedEvents = JSON.stringify(events);
  await redis.set(eventIdsKey(gameId), updatedEvents);
  await redis.set(eventKey(gameId, lastEvent.id), JSON.stringify(lastEvent));
}

export async function getEventById(
  eventId: string,
  redis: RedisClient,
  gameId: string
): Promise<NFLBoxscoreLastEvent | undefined> {
  const event = await redis.get(eventKey(gameId, eventId));
  return event ? JSON.parse(event) : undefined;
}
