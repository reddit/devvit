import type {
  Block,
  BlockRenderRequest,
  Dimensions,
  Effect,
  FormSubmittedEvent,
  Metadata,
  RealtimeSubscriptionEvent,
  UIEvent,
} from '@devvit/protos';
import { BlockRenderEventType, BlockType, EffectType } from '@devvit/protos';
import type { AssetMap } from '@devvit/shared-types/Assets.js';
import { Header } from '@devvit/shared-types/Header.js';
import { isValidImageURL } from '@devvit/shared-types/imageUtil.js';
import type { AssetsClient } from '../../../apis/AssetsClient/AssetsClient.js';
import { makeAPIClients } from '../../../apis/makeAPIClients.js';
import type { ModLogClient } from '../../../apis/modLog/ModLogClient.js';
import type { RealtimeClient } from '../../../apis/realtime/RealtimeClient.js';
import type { RedditAPIClient } from '../../../apis/reddit/RedditAPIClient.js';
import { getEffectsFromUIClient } from '../../../apis/ui/helpers/getEffectsFromUIClient.js';
import type {
  Data,
  Form,
  FormFunction,
  FormKey,
  MediaPlugin,
  Scheduler,
  SettingsClient,
  UIClient,
  UseChannelHook,
  UseFormHook,
  UseFormHookState,
  UseIntervalHook,
  UseIntervalHookState,
  UseStateHook,
} from '../../../types/index.js';
import type { KVStore } from '../../../types/kvStore.js';
import type { RedisClient } from '../../../types/redis.js';
import type { BlockElement } from '../../Devvit.js';
import { Devvit } from '../../Devvit.js';
import type { CacheHelper } from '../cache.js';
import { getContextFromMetadata } from '../context.js';
import { makeUniqueIdGenerator } from '../helpers/makeUniqueIdGenerator.js';
import type { LocalCache } from '../promise_cache.js';
import { BlocksTransformer } from './BlocksTransformer.js';
import type { EffectEmitter } from './EffectEmitter.js';

export type ReifiedBlockElement = {
  type: string;

  props: { [key: string]: unknown } | undefined;
  children: ReifiedBlockElementOrLiteral[];
};

export type ReifiedBlockElementOrLiteral = ReifiedBlockElement | string;

type ComponentState = {
  [hookIndex: number]: UseIntervalHookState | UseFormHookState | unknown;
};

type RenderState = {
  [componentKey: string]: ComponentState;
};

export function assertNotString(
  reified: ReifiedBlockElementOrLiteral
): asserts reified is ReifiedBlockElement {
  if (typeof reified === 'string') {
    throw new Error('Root element cannot be a string');
  }
}

// FIXME: don't build XML with a string concatenation :facepalm:
const toXML = (node: ReifiedBlockElement): string => {
  let xml = '';

  const attributes = node.props
    ? Object.keys(node.props)
        .map((key) => (key === 'onPress' ? '' : `${key}="${node.props![key]}"`))
        .join(' ')
    : '';

  xml += `<${node.type}${attributes ? ' ' + attributes : ''}>`;

  for (const child of node.children) {
    if (typeof child === 'string') {
      xml += child;
    } else {
      xml += toXML(child);
    }
  }

  xml += `</${node.type}>`;

  return xml;
};

function getIndentation(level: number): string {
  return '  '.repeat(level);
}

// FIXME: don't build XML with a string concatenation :facepalm:
function indentXML(xml: string): string {
  let formatted = '';
  let indentLevel = 0;
  const xmlArr = xml.split(/>\s*</);
  for (let i = 0; i < xmlArr.length; i++) {
    let node = xmlArr[i];
    if (i === 0) {
      node = node.trim();
    }
    if (i === xmlArr.length - 1) {
      node = node.trim();
    }
    const isClosingTag = node.charAt(0) === '/';
    if (isClosingTag) {
      indentLevel--;
    }
    formatted += getIndentation(indentLevel);
    if (i !== 0) {
      formatted += '<';
    }
    formatted += node;
    if (i !== xmlArr.length - 1) {
      formatted += '>\n';
    }
    if (!isClosingTag && node.indexOf('</') === -1 && node.charAt(node.length - 1) !== '/') {
      indentLevel++;
    }
  }
  return formatted;
}

/**
 * @internal
 * An instance of this class should be instantiated for each OnRender call.
 * This class is responsible for:
 *   - rendering JSX elements into Blocks.
 *   - managing state and hooks for each component.
 *   - drilling the shared clients into function components.
 */
export class BlocksReconciler implements EffectEmitter {
  component: JSX.ComponentFunction;
  event: BlockRenderRequest | UIEvent | undefined;
  state: {
    __renderState: RenderState;
    __postData?: { thingId?: string };
    __realtimeChannels?: string[];
    __cache?: LocalCache;
  };
  metadata: Metadata;

  // Common clients for props
  modLog: ModLogClient;
  reddit: RedditAPIClient;
  kvStore: KVStore;
  cache: CacheHelper;
  redis: RedisClient;
  scheduler: Scheduler;
  dimensions?: Dimensions;
  ui: UIClient;
  settings: SettingsClient;
  media: MediaPlugin;
  assets: AssetsClient;
  realtime: RealtimeClient;
  hooks: {
    useState: UseStateHook;
    useInterval: UseIntervalHook;
    useForm: UseFormHook;
    useChannel: UseChannelHook;
  };

  emitEffect(_dedupeKey: string, effect: Effect): void {
    this.effects.push(effect);
  }

  // hook management
  renderState: RenderState = {};
  currentComponentKey: string[] = [];
  currentHookIndex: number = 0;
  actions: Map<string, Devvit.Blocks.OnPressEventHandler> = new Map();
  forms: Map<FormKey, Form | FormFunction> = new Map();
  realtimeChannels: string[] = [];
  realtimeUpdated: boolean = false;
  pendingHooks: (() => Promise<void>)[] = [];

  isRendering: boolean = false;
  transformer: BlocksTransformer = new BlocksTransformer();

  effects: Effect[] = [];

  constructor(
    component: JSX.ComponentFunction,
    event: BlockRenderRequest | UIEvent | undefined,
    state: Data | undefined,
    metadata: Metadata,
    dimensions: Dimensions | undefined
  ) {
    this.component = component;
    this.event = event;
    this.state = {
      __renderState: {},
      ...state,
    };
    this.metadata = metadata;
    if (this.state.__realtimeChannels) {
      this.realtimeChannels = this.state.__realtimeChannels;
    }

    const apiClients = makeAPIClients({
      reconciler: this,
      hooks: true,
      ui: true,
      metadata,
    });
    this.cache = apiClients.cache;
    this.modLog = apiClients.modLog;
    this.reddit = apiClients.reddit;
    this.kvStore = apiClients.kvStore;
    this.redis = apiClients.redis;
    this.settings = apiClients.settings;
    this.scheduler = apiClients.scheduler;
    this.media = apiClients.media;
    this.assets = apiClients.assets;
    this.realtime = apiClients.realtime;
    this.dimensions = dimensions;
    this.ui = apiClients.ui;
    this.hooks = {
      useState: apiClients.useState,
      useInterval: apiClients.useInterval,
      useForm: apiClients.useForm,
      useChannel: apiClients.useChannel,
    };
  }

  #reset(): void {
    this.actions.clear();
    this.currentComponentKey = [];
    this.currentHookIndex = 0;
    this.pendingHooks = [];
    this.realtimeChannels = [];
    this.realtimeUpdated = false;
  }

  // This return type is an absolute mess here. Let this slide.
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  #makeContextProps() {
    const props: Devvit.Context = {
      ...getContextFromMetadata(this.metadata, this.state.__postData?.thingId),
      modLog: this.modLog,
      reddit: this.reddit,
      cache: this.cache,
      kvStore: this.kvStore,
      redis: this.redis,
      settings: this.settings,
      scheduler: this.scheduler,
      media: this.media,
      assets: this.assets,
      realtime: this.realtime,
      ui: this.ui,
      dimensions: this.dimensions,
      ...this.hooks,
    };
    props.debug.effects = this;
    return props;
  }

  async render(): Promise<Block> {
    await this.reconcile();

    this.isRendering = true;
    const results = await this.buildBlocksUI();
    this.isRendering = false;

    return results;
  }

  makeUniqueActionID(id: string): string {
    let uniqueId = id;
    let counter = 1;
    while (this.actions.has(uniqueId)) {
      uniqueId = `${id}.${counter++}`;
    }
    return uniqueId;
  }

  async reconcile(): Promise<void> {
    const blockElement: BlockElement = {
      type: this.component,
      props: this.#makeContextProps(),
      children: [],
    };

    const reified = await this.processBlock(blockElement);
    assertNotString(reified);
    await this.transformer.createBlocksElementOrThrow(reified);

    if (this.isUserActionRender && this.blockRenderEventId) {
      const onPress = this.actions.get(this.blockRenderEventId);
      if (onPress) {
        await onPress({});
      }
    }

    for (const hook of this.pendingHooks) {
      await hook();
    }

    this.buildNextState();
    this.#reset();
  }

  async buildBlocksUI(): Promise<Block> {
    const rootBlockElement: BlockElement = {
      type: this.component,
      props: this.#makeContextProps(),
      children: [],
    };

    const block = await this.renderElement(rootBlockElement);
    return this.transformer.ensureRootBlock(block);
  }

  async renderElement(element: JSX.Element): Promise<Block> {
    const reified = await this.processBlock(element);
    assertNotString(reified);

    if (Devvit.debug.emitSnapshots || this.metadata[Header.DebugRenderXML]?.values[0]) {
      console.log(indentXML(toXML(reified)));
    }
    if (Devvit.debug.emitState) {
      console.log(JSON.stringify(this.state, null, 2));
    }
    return await this.transformer.createBlocksElementOrThrow(reified);
  }

  #flatten(arr: ReifiedBlockElementOrLiteral[]): ReifiedBlockElementOrLiteral[] {
    const out: ReifiedBlockElementOrLiteral[] = [];
    for (const child of arr) {
      if (typeof child === 'string') {
        out.push(child);
      } else if (child.type === '__fragment') {
        out.push(...this.#flatten(child.children));
      } else {
        out.push(child);
      }
    }
    return out;
  }

  async processProps(props: { [key: string]: unknown }): Promise<void> {
    if (props.onPress) {
      const onPress = props.onPress as Devvit.Blocks.OnPressEventHandler;
      const name = onPress.name;
      const id = this.makeUniqueActionID(`${BlockType.BLOCK_BUTTON}.${name ?? 'onPress'}`);
      this.actions.set(id, onPress);
      props.onPress = id;
    }
    if (props.url) {
      props.url = await this.getAssetUrl(props.url as string);
    }
  }

  async getAssetUrl(asset: string): Promise<string> {
    // If this image exactly matches an asset, use the public URL for the asset instead
    let assetUrl: string | undefined = undefined;
    // @ts-ignore - it doesn't know what globalThis is
    const assets: AssetMap = globalThis?.devvit?.config?.assets;
    if (assets) {
      assetUrl = assets[asset];
    }
    /**
     * This block triggers a circuit breaker that we bypass if the image is:
     * 1. An asset that is already hosted on a verified image host
     * 2. A data url of a valid mimetype
     */
    if (!assetUrl && !isValidImageURL(asset)) {
      // This should not happen if we've set config.assets everywhere correctly, but it's good to
      // keep it around in case we missed something - instead of crashing & burning, we'll just
      // see some image flicker instead.
      console.log('No assets loaded on the config - falling back to plugin');

      try {
        assetUrl = await this.assets.getURL(asset);
        if (assets && assetUrl) {
          // Save resolved URL
          assets[asset] = assetUrl;
        }
      } catch {
        // nop - this is fine, just means this isn't an asset
      }
    }
    return assetUrl ?? asset;
  }

  async processBlock(
    element: JSX.Element | JSX.Element[],
    idGenerator: (id: string) => string = makeUniqueIdGenerator(),
    path: string[] = []
  ): Promise<ReifiedBlockElementOrLiteral> {
    const blockElement = element as BlockElement;
    // Intrinsic elements
    if (typeof blockElement.type === 'string') {
      const childrens = await Promise.all(
        blockElement.children.flatMap(async (child, i) => {
          if (child === undefined || child === null) return [];
          return await this.processBlock(child, idGenerator, [
            ...path,
            `${blockElement.type as string}.${i}`,
          ]);
        })
      );

      const children = childrens.flat();
      const collapsedChildren = this.#flatten(children);

      await this.processProps(blockElement.props || {});

      const reified: ReifiedBlockElement = {
        type: blockElement.type,
        props: blockElement.props,
        children: collapsedChildren,
      };
      return reified;
    }

    // Function components
    if (typeof blockElement.type === 'function') {
      // Create a unique component key to keep track of its state/hooks.
      const componentKey = idGenerator(
        `${path.length ? path.join('.') : 'root'}.${
          blockElement.type.name.length ? blockElement.type.name : 'anonymous'
        }`
      );
      this.currentComponentKey.push(componentKey);
      if (!this.renderState[componentKey]) {
        this.renderState[componentKey] = {};
      }

      const children = blockElement.children.flatMap((c) => c);

      const props = {
        ...this.#makeContextProps(),
        ...blockElement.props,
        children,
      };

      let result: JSX.Element | undefined;

      while (result === undefined) {
        try {
          result = await blockElement.type(props, this.#makeContextProps());
        } catch (promiseOrError) {
          // If the component throws a promise, wait for it to resolve and try again.
          // This is for components that have async logic in their hook callbacks.
          if (promiseOrError instanceof Promise) {
            result = await promiseOrError;
          } else {
            throw promiseOrError;
          }
        }
      }

      // Ensure that the number of hooks are same from the previous render.
      if (!this.isInitialRender) {
        const previousState = this.getPreviousComponentState();
        const prevHookCount = Object.keys(previousState).length;
        if (prevHookCount !== this.currentHookIndex) {
          throw new Error(
            'Invalid hook call. Hooks can only be called at the top-level of a function component. Make sure that you are not calling hooks inside loops, conditions, or nested functions.'
          );
        }
      }

      // Remember to always reset the current component key and hook index.
      this.currentComponentKey.pop();
      this.currentHookIndex = 0;

      if (typeof result === 'object') {
        return this.processBlock(result, idGenerator, [...path, blockElement.type.name]);
      }
    }

    // Strings - return as is
    if (typeof blockElement === 'string') {
      return blockElement;
    }

    // Numbers - transform to string
    if (typeof blockElement === 'number') {
      return `${blockElement}`;
    }

    let children: JSX.Children[] = [];
    let pathPrefix = '';

    if (Array.isArray(blockElement)) {
      // Array of elements
      children = blockElement;
    } else if (typeof blockElement.type === 'undefined' && blockElement.children) {
      // Fragment
      children = blockElement.children;
      pathPrefix = 'fragmentChild.';
    }
    return {
      type: '__fragment',
      props: undefined,
      children: await Promise.all(
        children.flatMap(
          async (child, i) =>
            await this.processBlock(child, idGenerator, [...path, `${pathPrefix}${i}`])
        )
      ),
    };
  }

  getCurrentComponentKey(): string[] {
    if (!this.currentComponentKey.at(-1)) {
      throw new Error('Current component key is missing');
    }

    return this.currentComponentKey;
  }

  getCurrentComponentState<S>(): { [hookIndex: number]: S } {
    const componentKey = this.currentComponentKey.at(-1);
    if (!componentKey) {
      throw new Error('Current component key is missing');
    }

    return this.renderState[componentKey] as { [hookIndex: number]: S };
  }

  getPreviousComponentState<S>(): { [hookIndex: number]: S } {
    const componentKey = this.currentComponentKey.at(-1);
    if (!componentKey) {
      throw new Error('Current component key is missing');
    }

    if (!this.state.__renderState[componentKey]) {
      this.state.__renderState[componentKey] = {};
    }

    return this.state.__renderState[componentKey] as { [hookIndex: number]: S };
  }

  get isInitialRender(): boolean {
    if (!this.event) {
      return false;
    }

    return (this.event as BlockRenderRequest).type === BlockRenderEventType.RENDER_INITIAL;
  }

  get isUserActionRender(): boolean {
    if (!this.event) {
      return false;
    }

    return (this.event as BlockRenderRequest).type === BlockRenderEventType.RENDER_USER_ACTION;
  }

  get isEffectRender(): boolean {
    if (!this.event) {
      return false;
    }

    return (this.event as BlockRenderRequest).type === BlockRenderEventType.RENDER_EFFECT_EVENT;
  }

  get formSubmittedEvent(): FormSubmittedEvent | undefined | false {
    if (!this.event) {
      return false;
    }

    return (this.event as UIEvent).formSubmitted;
  }

  get blockRenderEventId(): string | undefined | false {
    if (!this.event) {
      return false;
    }

    return (this.event as BlockRenderRequest).id;
  }

  get realtimeEvent(): RealtimeSubscriptionEvent | undefined | false {
    if (!this.event) {
      return false;
    }

    const realtimeEvent = (this.event as UIEvent).realtimeEvent;
    if (!realtimeEvent?.event?.channel) {
      return false;
    }

    return realtimeEvent;
  }

  runHook(hook: () => Promise<void>): void {
    this.pendingHooks.push(hook);
  }

  #rerenderAlreadyScheduled = false;

  rerenderIn(delayMs: number): void {
    if (this.#rerenderAlreadyScheduled) {
      return;
    }
    this.#rerenderAlreadyScheduled = true;
    this.effects.push({
      type: EffectType.EFFECT_RERENDER_UI,
      rerenderUi: {
        delaySeconds: delayMs / 1000,
      },
    });
  }

  addRealtimeChannel(channel: string): void {
    this.realtimeChannels.push(channel);
    this.realtimeUpdated = true;
  }

  removeRealtimeChannel(channel: string): void {
    this.realtimeChannels = this.realtimeChannels.filter((c) => c !== channel);
    this.realtimeUpdated = true;
  }

  get realtimeEffect(): Effect[] {
    if (this.realtimeUpdated && this.realtimeChannels.length > 0) {
      return [
        {
          type: EffectType.EFFECT_REALTIME_SUB,
          realtimeSubscriptions: {
            subscriptionIds: this.realtimeChannels,
          },
        },
      ];
    } else {
      return [];
    }
  }

  getEffects(): Effect[] {
    return [...getEffectsFromUIClient(this.ui), ...this.effects, ...this.realtimeEffect];
  }

  buildNextState(): void {
    // Flatten the renderStates down to arrays to ensure `undefined` values are maintained through serialization.
    // Input:
    // {"0": "one", "1": undefined, "2": "three"} (length: 3)
    // Before:
    // {"0": "one", "2": "three"} (length: 2; fails consistency check, see line 251)
    // After:
    // ["one", undefined, "three"] (length: 3)
    for (const key of Object.keys(this.renderState)) {
      this.renderState[key] = Object.values(this.renderState[key]);
    }
    this.state = {
      __postData: this.state.__postData,
      __renderState: this.renderState,
      __cache: this.state.__cache,
      ...(this.realtimeChannels.length > 0 ? { __realtimeChannels: this.realtimeChannels } : {}),
    };
  }
}
