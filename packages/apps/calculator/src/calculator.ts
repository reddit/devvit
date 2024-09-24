/* eslint-disable @typescript-eslint/naming-convention */

import type { Devvit, UseStateResult } from '@devvit/public-api';

import type { KeyValue } from './types.js';
import { Op } from './types.js';

type CurrentOp = Op | undefined;

const ops: Partial<Record<Op, (a: number, b: number) => number>> = {
  [Op.ADD]: (a, b) => a + b,
  [Op.SUBTRACT]: (a, b) => a - b,
  [Op.MULTIPLY]: (a, b) => a * b,
  [Op.DIVIDE]: (a, b) => a / b,
};

export class Calc {
  entry: number;
  private setEntry: UseStateResult<number>[1];
  decimal: number;
  private setDecimal: UseStateResult<number>[1];

  operandA: number | undefined;
  private setOperandA: UseStateResult<number | undefined>[1];

  op: CurrentOp;
  private setOp: UseStateResult<CurrentOp>[1];

  private operandB: number | undefined;
  private setOperandB: UseStateResult<number | undefined>[1];

  constructor({ useState }: Devvit.Context) {
    [this.op, this.setOp] = useState<CurrentOp>(undefined);
    [this.entry, this.setEntry] = useState(0);
    [this.decimal, this.setDecimal] = useState(0);
    [this.operandA, this.setOperandA] = useState<number | undefined>(undefined);
    [this.operandB, this.setOperandB] = useState<number | undefined>(undefined);
  }

  run(): void {
    if (
      this.operandA === undefined ||
      this.operandB === undefined ||
      this.op === undefined ||
      this.op === null
    ) {
      return;
    }

    const result = ops[this.op]!(this.operandA, this.operandB);
    this.setEntry(result);
    this.entry = result;
  }

  onKeyPress = (key: KeyValue): void => {
    switch (key) {
      case Op.ADD:
      case Op.SUBTRACT:
      case Op.MULTIPLY:
      case Op.DIVIDE:
        if (this.op === undefined && this.operandA !== undefined) {
          this.setOp(key);
          this.setOperandA(this.entry);
          this.setEntry(0);
          this.setDecimal(0);
        } else if (this.entry !== 0) {
          this.onKeyPress(Op.EQUALS);
          this.setEntry(0);
          this.setOperandA(this.entry);
          this.setOp(key);
          this.setDecimal(0);
        }
        break;
      case Op.EQUALS:
        this.setOperandB(this.entry);
        this.operandB = this.entry;
        this.run();
        this.setDecimal(0);
        this.setOp(undefined);
        this.setOperandA(undefined);
        this.setOperandB(undefined);
        break;
      case Op.DECIMAL:
        if (this.decimal === 0) {
          this.setDecimal(1);
        }
        break;
      case Op.CLEAR:
        this.setOp(undefined);
        this.setOperandA(undefined);
        this.setOperandB(undefined);
        this.setEntry(0);
        this.setDecimal(0);
        break;
      default: {
        let next = 0;
        if (this.operandA === undefined) {
          this.setOperandA(0);
        } else if (this.op !== undefined && this.operandB === undefined) {
          this.setOperandB(0);
        } else {
          next = this.entry;
        }
        if (this.decimal === 0) {
          next = this.nextNumber(next, key);
        } else {
          next = this.nextNumber(next, undefined, key);
          this.setDecimal((d) => d + 1);
        }
        this.setEntry(next);
      }
    }
  };

  private nextNumber(
    num: number,
    int: number | undefined = undefined,
    dec: number | undefined = undefined
  ): number {
    if (int !== undefined) {
      if (num * 10 > Number.MAX_SAFE_INTEGER) {
        return num;
      }
      return num * 10 + int;
    } else if (dec !== undefined) {
      const val = dec / Math.pow(10, this.decimal);
      if (num + val > Number.MAX_SAFE_INTEGER) {
        return num;
      }
      const newNum = num + val;
      if (newNum.toFixed(this.decimal - 1).length >= 20) {
        this.setDecimal((d) => d - 1);
        return num;
      }
      return newNum;
    }
    return num;
  }
}
