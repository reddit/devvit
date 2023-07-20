import { Page } from '../pages/page.js';
import { ButtonPageState } from './buttonPageState.js';
import { CategoryPageState } from '../components/CategoryPage.js';
import { ImagePageState } from './imagePageState.js';
import { StackPageState } from './stackPageState.js';
import { SpacerPageState } from './spacerPageState.js';
import { TextPageState } from './textPageState.js';
import { IconPageState } from './iconPageState.js';
import { ContextAPIClients, UseStateResult } from '@devvit/public-api';

export interface StatefulProps {
  useState: ContextAPIClients['useState'];
  goHome: () => void;
}

export class GalleryState {
  readonly _currentPage: UseStateResult<Page>;
  readonly _pageStates: Record<Page, CategoryPageState>;
  readonly showToast: (message: string) => void;

  constructor(renderContext: ContextAPIClients) {
    const { useState } = renderContext;
    const goHome = (): void => {
      this.currentPage = Page.HOME;
    };
    const statefulProps: StatefulProps = { useState, goHome };
    this._currentPage = useState<Page>(Page.HOME);
    this._pageStates = {
      [Page.HOME]: new CategoryPageState(statefulProps),
      [Page.BUTTONS]: new ButtonPageState(statefulProps),
      [Page.IMAGES]: new ImagePageState(statefulProps),
      [Page.STACKS]: new StackPageState(statefulProps),
      [Page.SPACERS]: new SpacerPageState(statefulProps),
      [Page.TEXT]: new TextPageState(statefulProps),
      [Page.ICON]: new IconPageState(statefulProps),
    };
    this.showToast = (message: string) => renderContext.ui.showToast(message);
  }

  get currentPage(): Page {
    return this._currentPage[0];
  }

  set currentPage(page: Page | string) {
    this._currentPage[1](page as Page);
  }

  pageState(page: Page): CategoryPageState {
    return this._pageStates[page];
  }
}
