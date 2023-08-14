import { CategoryPageState } from '../components/CategoryPage.js';
import { StatefulProps } from './state.js';

export class StackPageState extends CategoryPageState {
  constructor(statefulProps: StatefulProps) {
    super(statefulProps);
  }
}
