import type { Metadata, QueryResponse } from '@devvit/protos';
import { context } from '@devvit/server';
import type { JSONObject } from '@devvit/shared';

import { getRedditApiPlugins } from '../plugin.js';

export class GraphQL {
  /** @internal */
  static queryWithQueryString(q: string): Promise<QueryResponse> {
    return getRedditApiPlugins().GraphQL.Query(
      {
        query: q,
      },
      this.#metadata
    );
  }

  /** @internal */
  static query(operationName: string, id: string, variables: JSONObject): Promise<QueryResponse> {
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
