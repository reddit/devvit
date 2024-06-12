import { extractRows, fillColumns, getAllMatches } from './utils.js';
import type { TileItem } from '../types.js';

describe('utils test', () => {
  describe('column layout', () => {
    it('returns an array of arrays according to the number of columns', () => {
      expect(fillColumns(2, 4, []).length).toBe(2);
    });
    it('distributes items in columns when there is enough space', () => {
      expect(fillColumns(2, 2, [1, 2, 3, 4])).toEqual([
        [1, 2],
        [3, 4],
      ]);
    });
    it('distributes items in columns when there is not enough space', () => {
      expect(fillColumns(2, 2, [1, 2, 3, 4, 5])).toEqual([
        [1, 2],
        [3, 4],
      ]);
    });
    it('distributes items in columns when there is too much space', () => {
      expect(fillColumns(2, 2, [1, 2, 3])).toEqual([[1, 2], [3]]);
    });
    it('distributes items in columns with pagination', () => {
      expect(fillColumns(2, 2, [1, 2, 3, 4, 5], 1)).toEqual([[5], []]);
    });
  });

  describe('rowExtractor', () => {
    const tile = (text: string, active: boolean = false): TileItem => {
      return { text, active };
    };
    describe('row matcher', () => {
      it('returns null if no matches are found', () => {
        const tiles = [
          tile('A1'),
          tile('A2'),
          tile('A3'),
          tile('A4'),
          tile('B1'),
          tile('B2'),
          tile('B3'),
          tile('B4'),
          tile('C1'),
          tile('C2'),
          tile('C3'),
          tile('C4'),
          tile('D1'),
          tile('D2'),
          tile('D3'),
          tile('D4'),
        ];
        const pattern = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as (0 | 1)[];
        expect(extractRows(tiles, pattern)).toBe(null);
      });
      it('returns strings if match is found on column', () => {
        const tiles = [
          tile('A1'),
          tile('A2', true),
          tile('A3'),
          tile('A4'),
          tile('B1'),
          tile('B2', true),
          tile('B3'),
          tile('B4'),
          tile('C1'),
          tile('C2', true),
          tile('C3'),
          tile('C4'),
          tile('D1'),
          tile('D2', true),
          tile('D3'),
          tile('D4'),
        ];
        const pattern = [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0] as (0 | 1)[];
        expect(extractRows(tiles, pattern)).toEqual(['A2', 'B2', 'C2', 'D2']);
      });
      it('returns strings if match is found on row', () => {
        const tiles = [
          tile('A1'),
          tile('A2', true),
          tile('A3'),
          tile('A4'),
          tile('B1'),
          tile('B2', true),
          tile('B3'),
          tile('B4'),
          tile('C1', true),
          tile('C2', true),
          tile('C3', true),
          tile('C4', true),
          tile('D1'),
          tile('D2', true),
          tile('D3'),
          tile('D4'),
        ];
        const pattern = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0] as (0 | 1)[];
        expect(extractRows(tiles, pattern)).toEqual(['C1', 'C2', 'C3', 'C4']);
      });
    });
    describe('get all matches', () => {
      it('returns empty response if no matches were found', () => {
        const tiles = [
          tile('A1'),
          tile('A2'),
          tile('A3'),
          tile('A4'),
          tile('B1'),
          tile('B2'),
          tile('B3'),
          tile('B4'),
          tile('C1'),
          tile('C2'),
          tile('C3'),
          tile('C4'),
          tile('D1'),
          tile('D2'),
          tile('D3'),
          tile('D4'),
        ];
        expect(getAllMatches(tiles)).toEqual({
          type: 'null',
        });
      });
      it('returns empty response if no matches were found', () => {
        const tiles = [
          tile('A1', true),
          tile('A2'),
          tile('A3'),
          tile('A4'),
          tile('B1'),
          tile('B2'),
          tile('B3'),
          tile('B4', true),
          tile('C1'),
          tile('C2'),
          tile('C3', true),
          tile('C4'),
          tile('D1'),
          tile('D2', true),
          tile('D3'),
          tile('D4'),
        ];
        expect(getAllMatches(tiles)).toEqual({
          type: 'null',
        });
      });
      it('returns blackout response if the whole board is checked', () => {
        const tiles = [
          tile('A1', true),
          tile('A2', true),
          tile('A3', true),
          tile('A4', true),
          tile('B1', true),
          tile('B2', true),
          tile('B3', true),
          tile('B4', true),
          tile('C1', true),
          tile('C2', true),
          tile('C3', true),
          tile('C4', true),
          tile('D1', true),
          tile('D2', true),
          tile('D3', true),
          tile('D4', true),
        ];
        expect(getAllMatches(tiles)).toEqual({
          type: 'blackout',
          matches: [
            ['A1', 'A2', 'A3', 'A4'],
            ['B1', 'B2', 'B3', 'B4'],
            ['C1', 'C2', 'C3', 'C4'],
            ['D1', 'D2', 'D3', 'D4'],
          ],
        });
      });
      it('returns row 2', () => {
        const tiles = [
          tile('A1'),
          tile('A2'),
          tile('A3'),
          tile('A4'),
          tile('B1', true),
          tile('B2', true),
          tile('B3', true),
          tile('B4', true),
          tile('C1'),
          tile('C2', true),
          tile('C3'),
          tile('C4'),
          tile('D1'),
          tile('D2'),
          tile('D3'),
          tile('D4'),
        ];
        expect(getAllMatches(tiles)).toEqual({
          type: 'rows',
          matches: [['B1', 'B2', 'B3', 'B4']],
        });
      });
      it('returns col 2', () => {
        const tiles = [
          tile('A1'),
          tile('A2', true),
          tile('A3'),
          tile('A4'),
          tile('B1'),
          tile('B2', true),
          tile('B3'),
          tile('B4'),
          tile('C1'),
          tile('C2', true),
          tile('C3'),
          tile('C4'),
          tile('D1'),
          tile('D2', true),
          tile('D3'),
          tile('D4'),
        ];
        expect(getAllMatches(tiles)).toEqual({
          type: 'rows',
          matches: [['A2', 'B2', 'C2', 'D2']],
        });
      });
      it('returns worst case scenario', () => {
        const tiles = [
          tile('A1', true),
          tile('A2', true),
          tile('A3', true),
          tile('A4', true),
          tile('B1', true),
          tile('B2', true),
          tile('B3', true),
          tile('B4'),
          tile('C1', true),
          tile('C2', true),
          tile('C3', true),
          tile('C4', true),
          tile('D1', true),
          tile('D2', true),
          tile('D3', true),
          tile('D4', true),
        ];
        expect(getAllMatches(tiles)).toEqual({
          type: 'rows',
          matches: [
            ['A1', 'A2', 'A3', 'A4'], // row 1
            ['C1', 'C2', 'C3', 'C4'], // row 3
            ['D1', 'D2', 'D3', 'D4'], // row 4
            ['A1', 'B1', 'C1', 'D1'], // col 1
            ['A2', 'B2', 'C2', 'D2'], // col 2
            ['A3', 'B3', 'C3', 'D3'], // col 3
            ['A1', 'B2', 'C3', 'D4'], // diagonal 1
            ['A4', 'B3', 'C2', 'D1'], // diagonal 2
          ],
        });
      });
    });
  });
});

// Add more tests here or make a new file named `<subject under test>.test.ts`.
