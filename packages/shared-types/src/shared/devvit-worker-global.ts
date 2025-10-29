/**
 * Workers are expected to implement the MessagePort type where = onmessage()
 * is the worker ingress / runtime egress and postMessage() is the worker
 * egress / runtime ingress. See WorkerDispatcher.bindToWorkerPort() references
 * for where the runtime-worker bidirectional connection is established.
 */

import type { Metadata } from '@devvit/protos';

import type { AssetMap } from '../Assets.js';
import type { Config } from '../Config.js';
import type { AppConfig } from '../schemas/config-file.v1.js';
import type { FormField } from './form.js';

declare global {
  // to-do: align with devvit-app's connectedCallback.
  // eslint-disable-next-line no-var
  var devvit: DevvitWorkerGlobal | undefined;
}

// to-do: make the fields of this object non-nullish and initialize them in each
//        runtime when the object is initialized
/**
 * State initialized by the bootstrap (local runtime or compute) or `Devvit`
 * singleton.
 *
 * Webbit apps have two copies of the Devvit singleton in two bundles
 * (concatenated JavaScript): 1) blocks.template.ts 2) `@devvit/*` package
 * dependencies on `@devvit/public-api`. Only the first is actually constructed
 * by the classic bootstrap. The second is referenced indirectly by API calls
 * like `BlocksHandler` but static state is never initialized.
 */
export type DevvitWorkerGlobal = {
  /** Available to Webbit apps only. Initialized by `Devvit` singleton. */
  appConfig?: AppConfig;

  /** Initialized by `Devvit` singleton. */
  assets?: AssetMap;

  // to-do: provide equivalent for TypeScript runtimes.
  /** See bundle.template.cjs and PlatformUtil. Initialized by bootstrap. */
  compute?: { platform: 'web' | 'go' | 'node' };

  /** Nullish until initialized by bootloader. */
  config?: Config;

  /**
   * Provide a way for webbit apps to manage their own async local storage for
   * metadata. Initialized by bootstrap.
   */
  metadataProvider?: () => Readonly<Metadata> | undefined;

  /** Initialized by `Devvit` singleton. */
  settings?: {
    app?: FormField[] | undefined;
    installation?: FormField[] | undefined;
  };
};
