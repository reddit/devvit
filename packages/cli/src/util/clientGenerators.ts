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
  RemoteLogConsumerClientImpl,
  type RemoteLogConsumer,
} from '@devvit/protos/types/devvit/remote_logger/remote_logger.js';
import {
  HEADER_DEVVIT_CANARY,
  HEADER_DEVVIT_CLI,
  HEADER_USER_AGENT,
} from '../constants/Headers.js';
import { getAccessToken } from './auth.js';
import { DEVVIT_GATEWAY_URL, DEVVIT_PORTAL_API } from './config.js';
import { GrpcWebRpc } from './grpc-web-rpc.js';
import { NodeFetchRPC } from './node-fetch-twirp-rpc.js';

const APP_PATH = 'app';
const APP_VERSION_PATH = 'appVersion';
const INSTALLATIONS_PATH = 'installations';
const FEEDBACK_PATH = 'feedback';
const WAITLIST_PATH = 'waitlist';
const APP_SETTINGS_PATH = 'app-settings';
const EVENTS_PATH = 'events';
const PUBLISH_REQUEST_PATH = 'app-publish-request';

export function createAppClient(): AppClient {
  return new AppClientJSON(
    NodeFetchRPC({
      baseUrl: `${DEVVIT_PORTAL_API}/${APP_PATH}`,
      getToken: getAccessToken,
      headers: getHeaders(),
    })
  );
}

export function createAppVersionClient(): AppVersionClient {
  return new AppVersionClientJSON(
    NodeFetchRPC({
      baseUrl: `${DEVVIT_PORTAL_API}/${APP_VERSION_PATH}`,
      getToken: getAccessToken,
      headers: getHeaders(),
    })
  );
}

export function createAppSettingsClient(): DevPortalAppSettingsClient {
  return new DevPortalAppSettingsClientJSON(
    NodeFetchRPC({
      baseUrl: `${DEVVIT_PORTAL_API}/${APP_SETTINGS_PATH}`,
      getToken: getAccessToken,
      headers: getHeaders(),
    })
  );
}

export function createInstallationsClient(): InstallationsClient {
  return new InstallationsClientJSON(
    NodeFetchRPC({
      baseUrl: `${DEVVIT_PORTAL_API}/${INSTALLATIONS_PATH}`,
      getToken: getAccessToken,
      headers: getHeaders(),
    })
  );
}

export function createFeedbackClient(): FeedbackClient {
  return new FeedbackClientJSON(
    NodeFetchRPC({
      baseUrl: `${DEVVIT_PORTAL_API}/${FEEDBACK_PATH}`,
      getToken: getAccessToken,
      headers: getHeaders(),
    })
  );
}

export function createRemoteLoggerClient(): RemoteLogConsumer {
  return new RemoteLogConsumerClientImpl(
    new GrpcWebRpc({
      baseUrl: DEVVIT_GATEWAY_URL,
      getToken: getAccessToken,
      headers: getHeaders(),
    })
  );
}

export function createWaitlistClient(): WaitlistClient {
  return new WaitlistClientJSON(
    NodeFetchRPC({
      baseUrl: `${DEVVIT_PORTAL_API}/${WAITLIST_PATH}`,
      getToken: getAccessToken,
      headers: getHeaders(),
    })
  );
}

export function createEventsClient(): EventsClient {
  return new EventsClientJSON(
    NodeFetchRPC({
      baseUrl: `${DEVVIT_PORTAL_API}/${EVENTS_PATH}`,
      getToken: getAccessToken,
      isTokenOptional: true,
      headers: getHeaders(),
    })
  );
}

export function createAppPublishRequestClient(): DevPortalAppPublishRequestClient {
  return new DevPortalAppPublishRequestClientJSON(
    NodeFetchRPC({
      baseUrl: `${DEVVIT_PORTAL_API}/${PUBLISH_REQUEST_PATH}`,
      getToken: getAccessToken,
      headers: getHeaders(),
    })
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
