import type { Metadata, QueryResponse } from '@devvit/protos';
import { context } from '@devvit/server';
import type { JsonObject } from '@devvit/shared';

import { getRedditApiPlugins } from '../plugin.js';

export class GraphQL {
  /** @internal */
  static query(operationName: string, id: string, variables: JsonObject): Promise<QueryResponse> {
    return getRedditApiPlugins().GraphQL.PersistedQuery(
      {
        operationName,
        id,
        variables,
      },
      this.#metadata
    );
  }

  static get #metadata(): Metadata {
    return context.metadata;
  }
}
