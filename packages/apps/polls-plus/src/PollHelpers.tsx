import { Devvit } from '@devvit/public-api';
import numbroImport from 'numbro';
const numbro = numbroImport as unknown as typeof numbroImport.default;

export const formatCount = (count: number): string => {
  return numbro(count).format({
    average: true,
    mantissa: 1,
    optionalMantissa: true,
    trimMantissa: true,
    thousandSeparated: true,
  });
};

export function isStringValid(string: string | undefined | null): boolean {
  return string !== null && string !== undefined && string?.trim() !== '';
}

export function shuffle<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
}

// Keys and stuff

export enum KeyType {
  finish = `finish`,
  question = `question`,
  description = `description`,
  options = `options`,
  allowShowResults = `allowShowResults`,
  voted = `voted`,
  randomizeOrder = `randomizeOrder`,
}

const undefinedValue = `undefined`;

export const userKey = (userId: string | undefined, postId: string | undefined): string => {
  return `polls:${postId ?? undefinedValue}:${userId ?? undefinedValue}`;
};

export const key = (keyType: KeyType, postId: string | undefined): string => {
  return `polls:${postId ?? undefinedValue}:${keyType}`;
};

// What does our data look like?
/*
Input:
{
	event {
		values {
			question: string  (ex. "What is your choice?")
      description: string (ex. "Choose wisely")
      days: int (ex. 7)
			answers: string  (ex. "option 1, option 2, option 3")
      allowShowResults: boolean 
		}
	}
}

Data:
{
	polls {
		postId {
			finish: Timestamp (timestamp in ms, now + duration)
			question: String
			answers: [
				answer: String
				score: Int
			]
      description: string
      allowShowResults: boolean as string (ex. "true" or "false")
      voted {

      }
      userId {

      }
		}
	}

}
*/

/**
 * this only happens in the development environment, where postId is undefined.  This is a hack
 * to reset the state of the poll.  Also, the debug panel would be available.
 */
export const resetRedis = async (context: Devvit.Context): Promise<void> => {
  const redis = context.redis;
  await redis.mset({
    'polls:undefined:question': 'What is your favorite color?',
    'polls:undefined:finish': new Date().getTime() + 5 * 60 * 1000 + '',
    'polls:undefined:0': '0',
    'polls:undefined:1': '0',
    'polls:undefined:2': '0',
  });
  const voteds = await redis.zRange(`polls:undefined:voted`, 0, -1);
  if (voteds.length > 0) {
    await redis.del(...voteds.map((voted) => voted.member));
  }
  await redis.del(`polls:undefined:voted`);
  await redis.zAdd(
    `polls:undefined:options`,
    {
      member: 'Red',
      score: 0,
    },
    {
      member: 'Green',
      score: 1,
    },
    {
      member: 'Blue',
      score: 2,
    }
  );
  console.log('I reset the state');
};

// reset userID did vote on iddqd
Devvit.addTrigger({
  event: 'CommentCreate',
  onEvent: async (event, context) => {
    if (event.comment?.body === 'iddqd') {
      const postId = event.post?.id;
      const redis = context.redis;
      const userId = event.author?.id;
      await redis.del(userKey(userId, postId));
    }
  },
});
