import { demoEpl1 } from './epl/demo-epl-01.js';
import { demoMlb0 } from './mlb/demo-mlb-00.js';
import { demoMlb1 } from './mlb/demo-mlb-01.js';
import { demoMlb2 } from './mlb/demo-mlb-02.js';
import { demoMlb3 } from './mlb/demo-mlb-03.js';
import { demoMlb4 } from './mlb/demo-mlb-04.js';
import { demoNfl2 } from './nfl/demo-nfl-02.js';
import { demoNflGame01 } from './nfl/nfl-a-01.js';
import { demoNflGame02 } from './nfl/nfl-a-02.js';
import { demoNflGame03 } from './nfl/nfl-a-03.js';
import { demoNflGame04 } from './nfl/nfl-a-04.js';
import { demoNflGame05 } from './nfl/nfl-a-05.js';
import { demoNflGame06 } from './nfl/nfl-a-06.js';
import { demoNflGame07 } from './nfl/nfl-a-07.js';
import { demoNflGame08 } from './nfl/nfl-a-08.js';
import { demoNflGame09 } from './nfl/nfl-a-09.js';
import { demoNflGame10 } from './nfl/nfl-a-10.js';
import { demoNflGame11 } from './nfl/nfl-a-11.js';
import { demoNflGame12 } from './nfl/nfl-a-12.js';
import { demoNflGame13 } from './nfl/nfl-a-13.js';

export function leagueFromDemoId(demoString: string): string {
  const match = demoString.match(/-(mlb|epl|nfl)-/);
  return match ? match[1] : 'unknown';
}

export function demoForId(id: string): any {
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
    case `demo-epl-01`:
      return demoEpl1;
    case `demo-nfl-02`:
      return demoNfl2;
    case 'demo-nfl-game-01':
      return demoNflGame01;
    case 'demo-nfl-game-02':
      return demoNflGame02;
    case 'demo-nfl-game-03':
      return demoNflGame03;
    case 'demo-nfl-game-04':
      return demoNflGame04;
    case 'demo-nfl-game-05':
      return demoNflGame05;
    case 'demo-nfl-game-06':
      return demoNflGame06;
    case 'demo-nfl-game-07':
      return demoNflGame07;
    case 'demo-nfl-game-08':
      return demoNflGame08;
    case 'demo-nfl-game-09':
      return demoNflGame09;
    case 'demo-nfl-game-10':
      return demoNflGame10;
    case 'demo-nfl-game-11':
      return demoNflGame11;
    case 'demo-nfl-game-12':
      return demoNflGame12;
    case 'demo-nfl-game-13':
      return demoNflGame13;
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

export function nextNFLDemoPage(id: string): string {
  switch (id) {
    case `demo-nfl-game-01`:
      return `demo-nfl-game-02`;
    case `demo-nfl-game-02`:
      return `demo-nfl-game-03`;
    case `demo-nfl-game-03`:
      return `demo-nfl-game-04`;
    case `demo-nfl-game-04`:
      return `demo-nfl-game-05`;
    case `demo-nfl-game-05`:
      return `demo-nfl-game-06`;
    case `demo-nfl-game-06`:
      return `demo-nfl-game-07`;
    case `demo-nfl-game-07`:
      return `demo-nfl-game-08`;
    case `demo-nfl-game-08`:
      return `demo-nfl-game-09`;
    case `demo-nfl-game-09`:
      return `demo-nfl-game-10`;
    case `demo-nfl-game-10`:
      return `demo-nfl-game-11`;
    case `demo-nfl-game-11`:
      return `demo-nfl-game-12`;
    case `demo-nfl-game-12`:
      return `demo-nfl-game-13`;
    case `demo-nfl-game-13`:
      return `demo-nfl-game-01`;
    default:
      return `demo-nfl-game-01`;
  }
}
