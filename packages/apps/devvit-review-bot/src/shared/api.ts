/** Empty acknowledgement returned by scheduled cleanup. */
export type OnCronUninstallCleanupRsp = Record<string, never>;

/** Error details returned by an endpoint. */
export type ErrorRsp = { error: string; status: number };

export type Endpoint = (typeof Endpoint)[keyof typeof Endpoint];

export const Endpoint = {
  OnCronUninstallCleanup: 'internal/on/cron/uninstall-cleanup',
} as const;

export const EndpointMethod = {
  [Endpoint.OnCronUninstallCleanup]: 'POST',
} as const satisfies { [endpoint: string]: 'GET' | 'POST' };
