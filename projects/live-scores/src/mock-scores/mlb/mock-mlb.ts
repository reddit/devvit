import { demoMlb0 } from './demo-mlb-00.js';
import { demoMlb1 } from './demo-mlb-01.js';
import { demoMlb2 } from './demo-mlb-02.js';
import { demoMlb3 } from './demo-mlb-03.js';
import { demoMlb4 } from './demo-mlb-04.js';

export function mlbDemoForId(id: string): any {
  switch (id) {
    case `demo-mlb-00`:
      return demoMlb0;
    case `demo-mlb-01`:
      return demoMlb1;
    case `demo-mlb-02`:
      return demoMlb2;
    case `demo-mlb-03`:
      return demoMlb3;
    case `demo-mlb-04`:
      return demoMlb4;
    default:
      return undefined;
  }
}

export function nextMLBDemoPage(id: string): string {
  switch (id) {
    case `demo-mlb-01`:
      return `demo-mlb-02`;
    case `demo-mlb-02`:
      return `demo-mlb-03`;
    case `demo-mlb-03`:
      return `demo-mlb-04`;
    case `demo-mlb-04`:
      return `demo-mlb-00`;
    case `demo-mlb-00`:
      return `demo-mlb-01`;
    default:
      return `demo-mlb-01`;
  }
}
