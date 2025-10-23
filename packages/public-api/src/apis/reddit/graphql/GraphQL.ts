import type { Metadata, QueryResponse } from '@devvit/protos';

import { Devvit } from '../../../devvit/Devvit.js';
import type { JSONObject } from '../../../types/json.js';

export class GraphQL {
  /** @internal */
  static queryWithQueryString(q: string, metadata: Metadata | undefined): Promise<QueryResponse> {
    return Devvit.redditAPIPlugins.GraphQL.Query(
      {
        query: q,
      },
      metadata
    );
  }

  /** @internal */
  static query(
    operationName: string,
    id: string,
    variables: JSONObject,
    metadata: Metadata | undefined
  ): Promise<QueryResponse> {
    return Devvit.redditAPIPlugins.GraphQL.PersistedQuery(
      {
        operationName,
        id,
        variables,
      },
      metadata
    );
  }
}
