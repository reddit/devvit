import { Observable } from 'rxjs';

import { lruDistinct } from './lru-distinct.js';

describe('lruDistinct', () => {
  test('basic distinct behavior', () => {
    const result: number[] = [];
    const source = new Observable<number>((subscriber) => {
      [1, 2, 2, 3].forEach((v) => subscriber.next(v));
      subscriber.complete();
    });

    source.pipe<number>(lruDistinct<number, number>()).subscribe((value) => result.push(value));

    expect(result).toStrictEqual([1, 2, 3]);
  });

  test('LRU eviction with maxKeys', () => {
    const result: number[] = [];
    const source = new Observable<number>((subscriber) => {
      [1, 2, 3, 4].forEach((v) => subscriber.next(v));
      subscriber.complete();
    });

    source
      .pipe<number>(lruDistinct<number, number>(undefined, 2))
      .subscribe((value) => result.push(value));

    expect(result).toStrictEqual([1, 2, 3, 4]);
  });

  test('keeps most recent values', () => {
    const result: number[] = [];
    const source = new Observable<number>((subscriber) => {
      [1, 2, 1, 3].forEach((v) => subscriber.next(v));
      subscriber.complete();
    });

    source
      .pipe<number>(lruDistinct<number, number>(undefined, 2))
      .subscribe((value) => result.push(value));

    expect(result).toStrictEqual([1, 2, 3]);
  });

  test('uses keySelector', () => {
    interface Item {
      id: number;
      value: string;
    }
    const result: Item[] = [];
    const input: Item[] = [
      { id: 1, value: 'a' },
      { id: 1, value: 'b' },
      { id: 2, value: 'c' },
    ];
    const source = new Observable<Item>((subscriber) => {
      input.forEach((v) => subscriber.next(v));
      subscriber.complete();
    });

    source
      .pipe<Item>(lruDistinct<Item, number>((item) => item.id))
      .subscribe((value) => result.push(value));

    expect(result).toStrictEqual([
      { id: 1, value: 'a' },
      { id: 2, value: 'c' },
    ]);
  });
});
