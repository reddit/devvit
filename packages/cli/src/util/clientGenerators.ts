import type { RemoteLogConsumer } from '@devvit/protos';
import { RemoteLogConsumerClientImpl } from '@devvit/protos';
import type {
  AppClient,
  AppVersionClient,
  DevPortalAppSettingsClient,
  FeedbackClient,
  InstallationsClient,
  WaitlistAdminClient,
  WaitlistClient,
} from '@devvit/protos/community.js';
import {
  AppClientJSON,
  AppVersionClientJSON,
  DevPortalAppSettingsClientJSON,
  FeedbackClientJSON,
  InstallationsClientJSON,
  WaitlistAdminClientJSON,
  WaitlistClientJSON,
} from '@devvit/protos/community.js';
import { Headers } from 'node-fetch';
import {
  HEADER_DEVVIT_CANARY,
  HEADER_DEVVIT_CLI,
  HEADER_USER_AGENT,
} from '../constants/Headers.js';
import type { DevvitCommand } from './commands/DevvitCommand.js';
import { DEVVIT_GATEWAY_URL, DEVVIT_PORTAL_API } from './config.js';
import { GrpcWebRpc } from './grpc-web-rpc.js';
import { NodeFetchRPC } from './node-fetch-twirp-rpc.js';

const APP_PATH = 'app';
const APP_VERSION_PATH = 'appVersion';
const INSTALLATIONS_PATH = 'installations';
const FEEDBACK_PATH = 'feedback';
const WAITLIST_PATH = 'waitlist';
const APP_SETTINGS_PATH = 'app-settings';

export function createAppClient(instance: DevvitCommand): AppClient {
  return new AppClientJSON(
    NodeFetchRPC({
      baseUrl: `${DEVVIT_PORTAL_API}/${APP_PATH}`,
      getToken: () => instance.getAccessToken(),
      headers: getHeaders(),
    })
  );
}

export function createAppVersionClient(instance: DevvitCommand): AppVersionClient {
  return new AppVersionClientJSON(
    NodeFetchRPC({
      baseUrl: `${DEVVIT_PORTAL_API}/${APP_VERSION_PATH}`,
      getToken: () => instance.getAccessToken(),
      headers: getHeaders(),
    })
  );
}

export function createAppSettingsClient(instance: DevvitCommand): DevPortalAppSettingsClient {
  return new DevPortalAppSettingsClientJSON(
    NodeFetchRPC({
      baseUrl: `${DEVVIT_PORTAL_API}/${APP_SETTINGS_PATH}`,
      getToken: () => instance.getAccessToken(),
      headers: getHeaders(),
    })
  );
}

export function createInstallationsClient(instance: DevvitCommand): InstallationsClient {
  return new InstallationsClientJSON(
    NodeFetchRPC({
      baseUrl: `${DEVVIT_PORTAL_API}/${INSTALLATIONS_PATH}`,
      getToken: () => instance.getAccessToken(),
      headers: getHeaders(),
    })
  );
}

export function createFeedbackClient(instance: DevvitCommand): FeedbackClient {
  return new FeedbackClientJSON(
    NodeFetchRPC({
      baseUrl: `${DEVVIT_PORTAL_API}/${FEEDBACK_PATH}`,
      getToken: () => instance.getAccessToken(),
      headers: getHeaders(),
    })
  );
}

export function createRemoteLoggerClient(instance: DevvitCommand): RemoteLogConsumer {
  return new RemoteLogConsumerClientImpl(
    new GrpcWebRpc({
      baseUrl: DEVVIT_GATEWAY_URL,
      getToken: () => instance.getAccessToken(),
      headers: getHeaders(),
    })
  );
}

export function createWaitlistClient(instance: DevvitCommand): WaitlistClient {
  return new WaitlistClientJSON(
    NodeFetchRPC({
      baseUrl: `${DEVVIT_PORTAL_API}/${WAITLIST_PATH}`,
      getToken: () => instance.getAccessToken(),
      headers: getHeaders(),
    })
  );
}

export function createWaitlistAdminClient(instance: DevvitCommand): WaitlistAdminClient {
  return new WaitlistAdminClientJSON(
    NodeFetchRPC({
      baseUrl: `${DEVVIT_PORTAL_API}/admin/${WAITLIST_PATH}`,
      getToken: () => instance.getAccessToken(),
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
