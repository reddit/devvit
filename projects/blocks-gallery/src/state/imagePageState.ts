import { CategoryPageState } from '../components/CategoryPage.js';
import { StatefulProps } from './state.js';

export class ImagePageState extends CategoryPageState {
  constructor(statefulProps: StatefulProps) {
    super(statefulProps);
  }
}
