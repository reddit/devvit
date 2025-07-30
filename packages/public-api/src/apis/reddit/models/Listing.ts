import type { T1ID, T3ID } from '../../../types/tid.js';
import { makeGettersEnumerable } from '../helpers/makeGettersEnumerable.js';

export type MoreObject = {
  parentId: T1ID | T3ID;
  children: T1ID[];
  depth: number;
};

export type ListingFetchOptions = {
  after?: string;
  before?: string;
  limit?: number;
  pageSize?: number;
  more?: MoreObject;
};

export type ListingFetchResponse<T> = {
  children: T[];
  before?: string;
  after?: string;
  more?: MoreObject;
};

export interface Listing<T> {
  /** @internal */
  children: T[];
  /** @internal */
  _fetch: (options: ListingFetchOptions) => Promise<ListingFetchResponse<T>>;
}

type ListingOptions<T> = {
  hasMore?: boolean;
  after?: string;
  before?: string;
  pageSize?: number;
  limit?: number;
  children?: T[];
  more?: MoreObject;
  fetch: (options: ListingFetchOptions) => Promise<ListingFetchResponse<T>>;
};

const DEFAULT_PAGE_SIZE = 100;
const DEFAULT_LIMIT = Infinity;

export class Listing<T> {
  #before?: string;
  #after?: string;
  #more?: MoreObject;
  #started: boolean = false;

  pageSize: number = DEFAULT_PAGE_SIZE;
  limit: number = DEFAULT_LIMIT;
  children: T[] = [];

  /**
   * @internal
   */
  constructor(options: ListingOptions<T>) {
    makeGettersEnumerable(this);

    this._fetch = options.fetch;
    this.pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;
    this.limit = options.limit ?? DEFAULT_LIMIT;
    this.#after = options.after;
    this.#before = options.before;
    this.#more = options.more;

    if (options.children) {
      this.children = options.children;
    }
  }

  get hasMore(): boolean {
    return !this.#started || Boolean(this.#after || this.#before || this.#more);
  }

  async *[Symbol.asyncIterator](): AsyncIterator<T> {
    let currentIndex = 0;

    while (true) {
      if (currentIndex === this.children.length) {
        if (this.hasMore) {
          const nextPage = await this.#next();
          // r2 api sometimes returns an empty page
          if (nextPage.length === 0) {
            break;
          }
        } else {
          break;
        }
      }

      yield this.children[currentIndex];
      currentIndex++;

      if (currentIndex === this.limit) {
        break;
      }
    }
  }

  setMore(more: MoreObject | undefined): void {
    this.#more = more;
  }

  preventInitialFetch(): void {
    this.#started = true;
  }

  async #next(): Promise<T[]> {
    if (!this.hasMore) {
      throw new Error('This listing does not have any more items to load.');
    }

    const { children, before, after, more } = await this._fetch({
      before: this.#before,
      after: this.#after,
      limit: this.pageSize,
      more: this.#more,
    });

    this.children.push(...children);
    this.#before = before;
    this.#after = after;
    this.#more = more;

    this.#started = true;

    return children;
  }

  async all(): Promise<T[]> {
    while (this.hasMore && this.children.length < this.limit) {
      await this.#next();
    }

    return this.children.slice(0, this.limit);
  }

  async get(count: number): Promise<T[]> {
    const limit = count <= this.limit ? count : this.limit;

    while (this.hasMore && this.children.length < limit) {
      await this.#next();
    }

    return this.children.slice(0, limit);
  }
}
