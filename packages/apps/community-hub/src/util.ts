import { Context } from '@devvit/public-api';

/**
 * Note that if there is a remainder it'll be added to the last array.
 *
 * That means you may need .reverse() on the output.
 */
export const chunk = (arr: any[], size: number) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_: any, i: number) =>
    arr.slice(i * size, i * size + size)
  );

export const isEven = (n: number) => {
  return n % 2 == 0;
};

export const isOdd = (n: number) => {
  return Math.abs(n % 2) == 1;
};

export const randomId = () => {
  return Math.floor(Math.random() * Date.now()).toString();
};

export const standardizeUsername = (username: string) => {
  let newU = username.toLowerCase().trim();
  if (newU.startsWith('u/')) {
    newU = newU.replace(`u/`, ``);
  }
  return newU;
};

export const formatUrl = (url: string | null | undefined) => {
  let newUrl = url;
  if (!newUrl) return null;

  newUrl = newUrl.trim();

  return newUrl.startsWith('http') ? newUrl : `https://${newUrl}`;
};

// export const promptLogin = (user: string, context: Context) => {
//   if (!user) {
//       context.ui.showToast("You must be logged in to take this action.")
//     return false
//   } else return true
// }

/**
 * We don't expose structuredClone in our web worker unfortunately. Doesn't
 * handle a bunch of edge cases but we don't need it for our uses.
 */
export const deepClone = <T>(object: T): T => JSON.parse(JSON.stringify(object));
