import type {
  AppClient,
  AppVersionClient,
  DevPortalAppSettingsClient,
  EventsClient,
  FeedbackClient,
  InstallationsClient,
  WaitlistClient,
} from '@devvit/protos/community.js';
import {
  AppClientJSON,
  AppVersionClientJSON,
  DevPortalAppSettingsClientJSON,
  EventsClientJSON,
  FeedbackClientJSON,
  InstallationsClientJSON,
  WaitlistClientJSON,
} from '@devvit/protos/community.js';
import type { DevPortalAppPublishRequestClient } from '@devvit/protos/types/devvit/dev_portal/dev_portal.twirp-client.js';
import { DevPortalAppPublishRequestClientJSON } from '@devvit/protos/types/devvit/dev_portal/dev_portal.twirp-client.js';
import {
  type RemoteLogConsumer,
  RemoteLogConsumerClientImpl,
} from '@devvit/protos/types/devvit/remote_logger/remote_logger.js';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';
import type { Observable } from 'rxjs';
import { TwirpError, TwirpErrorCode } from 'twirp-ts';

import {
  HEADER_DEVVIT_CANARY,
  HEADER_DEVVIT_CLI,
  HEADER_USER_AGENT,
} from '../constants/Headers.js';
import { getAccessToken } from './auth.js';
import { DEVVIT_GATEWAY_URL, DEVVIT_PORTAL_API } from './config.js';
import { GrpcWebRpc } from './grpc-web-rpc.js';
import { NodeFetchRPC } from './node-fetch-twirp-rpc.js';
import { sleep } from './sleep.js';

const MAX_RETRIES = 3;
const RETRY_DELAY_MULTIPLIER = 1000;
// See https://twitchtv.github.io/twirp/docs/spec_v7.html#error-codes
const TWIRP_CODES_TO_NOT_RETRY = [
  // 400
  TwirpErrorCode.InvalidArgument,
  TwirpErrorCode.Malformed,
  TwirpErrorCode.OutOfRange,
  // 401
  TwirpErrorCode.Unauthenticated,
  // 403
  TwirpErrorCode.PermissionDenied,
  // 404
  TwirpErrorCode.NotFound,
  TwirpErrorCode.BadRoute,
  // 408
  TwirpErrorCode.Canceled,
  TwirpErrorCode.DeadlineExceeded,
  // 409
  TwirpErrorCode.AlreadyExists,
  TwirpErrorCode.Aborted,
  // 412
  TwirpErrorCode.FailedPrecondition,
  // 429
  TwirpErrorCode.ResourceExhausted,
];

const APP_PATH = 'app';
const APP_VERSION_PATH = 'appVersion';
const INSTALLATIONS_PATH = 'installations';
const FEEDBACK_PATH = 'feedback';
const WAITLIST_PATH = 'waitlist';
const APP_SETTINGS_PATH = 'app-settings';
const EVENTS_PATH = 'events';
const PUBLISH_REQUEST_PATH = 'app-publish-request';

export function createAppClient(): AppClient {
  return wrapWithRetry(
    new AppClientJSON(
      NodeFetchRPC({
        baseUrl: `${DEVVIT_PORTAL_API}/${APP_PATH}`,
        getToken: getAccessToken,
        headers: getHeaders(),
      })
    )
  );
}

export function createAppVersionClient(): AppVersionClient {
  return wrapWithRetry(
    new AppVersionClientJSON(
      NodeFetchRPC({
        baseUrl: `${DEVVIT_PORTAL_API}/${APP_VERSION_PATH}`,
        getToken: getAccessToken,
        headers: getHeaders(),
      })
    )
  );
}

export function createAppSettingsClient(): DevPortalAppSettingsClient {
  return wrapWithRetry(
    new DevPortalAppSettingsClientJSON(
      NodeFetchRPC({
        baseUrl: `${DEVVIT_PORTAL_API}/${APP_SETTINGS_PATH}`,
        getToken: getAccessToken,
        headers: getHeaders(),
      })
    )
  );
}

export function createInstallationsClient(): InstallationsClient {
  return wrapWithRetry(
    new InstallationsClientJSON(
      NodeFetchRPC({
        baseUrl: `${DEVVIT_PORTAL_API}/${INSTALLATIONS_PATH}`,
        getToken: getAccessToken,
        headers: getHeaders(),
      })
    )
  );
}

export function createFeedbackClient(): FeedbackClient {
  return wrapWithRetry(
    new FeedbackClientJSON(
      NodeFetchRPC({
        baseUrl: `${DEVVIT_PORTAL_API}/${FEEDBACK_PATH}`,
        getToken: getAccessToken,
        headers: getHeaders(),
      })
    )
  );
}

export function createRemoteLoggerClient(): RemoteLogConsumer {
  return wrapWithRetry(
    new RemoteLogConsumerClientImpl(
      new GrpcWebRpc({
        baseUrl: DEVVIT_GATEWAY_URL,
        getToken: getAccessToken,
        headers: getHeaders(),
      })
    )
  );
}

export function createWaitlistClient(): WaitlistClient {
  return wrapWithRetry(
    new WaitlistClientJSON(
      NodeFetchRPC({
        baseUrl: `${DEVVIT_PORTAL_API}/${WAITLIST_PATH}`,
        getToken: getAccessToken,
        headers: getHeaders(),
      })
    )
  );
}

export function createEventsClient(): EventsClient {
  return wrapWithRetry(
    new EventsClientJSON(
      NodeFetchRPC({
        baseUrl: `${DEVVIT_PORTAL_API}/${EVENTS_PATH}`,
        getToken: getAccessToken,
        isTokenOptional: true,
        headers: getHeaders(),
      })
    )
  );
}

export function createAppPublishRequestClient(): DevPortalAppPublishRequestClient {
  return wrapWithRetry(
    new DevPortalAppPublishRequestClientJSON(
      NodeFetchRPC({
        baseUrl: `${DEVVIT_PORTAL_API}/${PUBLISH_REQUEST_PATH}`,
        getToken: getAccessToken,
        headers: getHeaders(),
      })
    )
  );
}

function getHeaders(): Headers {
  const headers = new Headers();
  headers.set(...HEADER_USER_AGENT());
  headers.set(...HEADER_DEVVIT_CLI());

  if (process.env.DEVVIT_CANARY) {
    console.warn(`Warning: setting devvit-canary to "${process.env.DEVVIT_CANARY}"`);
    headers.set(...HEADER_DEVVIT_CANARY(process.env.DEVVIT_CANARY));
  }

  return headers;
}

function wrapWithRetry<
  T extends Record<KT, (...args: any[]) => Promise<unknown> | Observable<unknown>>,
  KT extends keyof T,
>(client: T): T {
  return new Proxy(client, {
    get(target, prop, receiver) {
      const originalMethod = Reflect.get(target, prop, receiver).bind(target);

      return async function (...args: unknown[]) {
        let retries = 0;
        let firstError: unknown;
        let lastError: unknown;

        while (retries < MAX_RETRIES) {
          await sleep(retries * RETRY_DELAY_MULTIPLIER); // back off with each retry
          try {
            return await originalMethod(...args);
          } catch (error) {
            if (error instanceof TwirpError && TWIRP_CODES_TO_NOT_RETRY.includes(error.code)) {
              if (!firstError) {
                // This is the first error, so we should just throw it directly.
                throw error;
              }

              // If the error is a Twirp error that we don't want to retry, but
              // wasn't the first error, we should throw a new error with
              // both the first and this error.
              throw new Error(
                `Failed after ${retries + 1} attempts.
First error: ${StringUtil.caughtToString(firstError)}
Last error: ${StringUtil.caughtToString(error)}`
              );
            }
            if (!firstError) {
              firstError = error;
            }
            lastError = error;
            retries++;
          }
        }

        throw new Error(
          `Failed after ${MAX_RETRIES} attempts.
First error: ${StringUtil.caughtToString(firstError)}
Last error: ${StringUtil.caughtToString(lastError)}`
        );
      };
    },
  });
}
