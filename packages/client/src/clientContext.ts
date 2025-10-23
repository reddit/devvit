import type { Context } from '@devvit/shared-types/client/client-context.js';

// Use nullish coalescing for local development.
export const context: Context = globalThis.devvit?.context!;
