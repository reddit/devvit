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
import { BlockRenderEventType, EffectType } from '@devvit/protos';
import { Header } from '@devvit/shared-types/Header.js';
import type { JSONObject, PartialJSONObject } from '@devvit/shared-types/json.js';
import type { FormKey } from '@devvit/shared-types/useForm.js';
import type { AssetsClient } from '../../../apis/AssetsClient/AssetsClient.js';
import { makeAPIClients } from '../../../apis/makeAPIClients.js';
import type { ModLogClient } from '../../../apis/modLog/ModLogClient.js';
import type { RealtimeClient } from '../../../apis/realtime/RealtimeClient.js';
import type { RedditAPIClient } from '../../../apis/reddit/RedditAPIClient.js';
import { getEffectsFromUIClient } from '../../../apis/ui/helpers/getEffectsFromUIClient.js';
import type {
  Form,
  FormFunction,
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

/** Serializable. */
type ComponentState = {
  [hookIndex: number]: UseIntervalHookState | UseFormHookState | JSONObject;
};

/** Serializable. */
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
  actions: Map<string, Function> = new Map();
  forms: Map<FormKey, Form | FormFunction> = new Map();
  realtimeChannels: string[] = [];
  realtimeUpdated: boolean = false;
  pendingHooks: (() => Promise<void>)[] = [];

  isRendering: boolean = false;
  transformer: BlocksTransformer = new BlocksTransformer(() => this.assets);

  effects: Effect[] = [];

  constructor(
    component: JSX.ComponentFunction,
    event: BlockRenderRequest | UIEvent | undefined,
    state: PartialJSONObject | undefined,
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

  #makeContextProps(): Devvit.Context {
    // skip typechecks for useForm which is templatized.
    const props: Omit<Devvit.Context, 'useForm'> = {
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
      uiEnvironment: {
        timezone: this.metadata[Header.Timezone]?.values[0],
        locale: this.metadata[Header.Language]?.values[0],
        dimensions: this.dimensions,
      },
      ...this.hooks,
    };
    props.debug.effects = this;
    return props as Devvit.Context;
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
    const ctx = this.#makeContextProps();
    const blockElement: BlockElement = {
      type: this.component,
      props: ctx,
      children: [],
    };

    const reified = await this.processBlock(blockElement);
    assertNotString(reified);

    this.transformer.createBlocksElementOrThrow(reified);

    if (this.isUserActionRender && this.blockRenderEventId) {
      const handler = this.actions.get(this.blockRenderEventId);
      if (handler) {
        await handler((this.event as BlockRenderRequest).data);
      }
    }

    for (const hook of this.pendingHooks) {
      await hook();
    }

    this.buildNextState();
    this.#reset();
  }

  async buildBlocksUI(): Promise<Block> {
    const ctx = this.#makeContextProps();
    const rootBlockElement: BlockElement = {
      type: this.component,
      props: ctx,
      children: [],
    };

    const block = await this.renderElement(ctx, rootBlockElement);
    return this.transformer.ensureRootBlock(block);
  }

  async renderElement(ctx: Devvit.Context, element: JSX.Element): Promise<Block> {
    const reified = await this.processBlock(element);
    assertNotString(reified);

    if (Devvit.debug.emitSnapshots || ctx.debug.emitSnapshots)
      console.debug(indentXML(toXML(reified)));
    if (Devvit.debug.emitState || ctx.debug.emitState)
      console.debug(JSON.stringify(this.state, undefined, 2));

    return this.transformer.createBlocksElementOrThrow(reified);
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

  async processProps(block: BlockElement): Promise<void> {
    const props = block.props ?? {};
    const actionHandlers = ['onPress', 'onMessage'];
    for (const action of actionHandlers) {
      if (action in props) {
        const handler = props[action] as Function;
        const name = handler?.name;
        const id = this.makeUniqueActionID(`${block.type}.${name ?? action}`);
        this.actions.set(id, handler);
        props[action] = id;
      }
    }
  }

  async processBlock(
    element: JSX.Element | JSX.Element[],
    idGenerator: (id: string) => string = makeUniqueIdGenerator(),
    path: string[] = []
  ): Promise<ReifiedBlockElementOrLiteral> {
    const blockElement = element as BlockElement;
    // Intrinsic elements
    if (typeof blockElement.type === 'string') {
      const childrens: ReifiedBlockElementOrLiteral[] = [];

      /**
       * Resist the urge to clean this up with flatMap. We need to await each processBlock _in order_.
       *
       * Number of times this has caused a major headache: 3
       *
       * Please increment the counter above if you had to revert this.
       */
      for (let i = 0; i < blockElement.children.length; i++) {
        const child = blockElement.children[i];
        if (child === undefined || child === null) continue;
        childrens.push(
          await this.processBlock(child, idGenerator, [
            ...path,
            `${blockElement.type as string}.${i}`,
          ])
        );
      }

      const children = childrens.flat();
      const collapsedChildren = this.#flatten(children);

      await this.processProps(blockElement);

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
        /**
         * Note: This relies on the magic of {0: "a", 1: "b"} => ["a", "b"] and back under many circumstances.
         * It is too magic, but as this component is complicated and deprecated, it is not worth fixing.
         *
         * In fact previousState is an array.  This is confusing.
         */
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
    /**
     * Note: This relies on the magic of {0: "a", 1: "b"} => ["a", "b"] and back under many circumstances.
     * It is too magic, but as this component is complicated and deprecated, it is not worth fixing.
     */
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
