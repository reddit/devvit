import type { QueryResponse } from '@devvit/protos/json/devvit/plugin/redditapi/graphql/graphql_msg.js';
import type { Metadata } from '@devvit/protos/lib/Types.js';

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
