import { ContextAPIClients, UseStateResult } from '@devvit/public-api';

import { Page } from '../pages/page.js';
import { CategoryPageState } from '../components/CategoryPage.js';

export interface StatefulProps {
  useState: ContextAPIClients['useState'];
  goHome: () => void;
}

const PAGES = [
  Page.HOME,
  Page.BUTTONS,
  Page.IMAGES,
  Page.STACKS,
  Page.SPACERS,
  Page.TEXT,
  Page.ICON,
  Page.COLOR,
  Page.SIZE,
];

/**
 * Override default category for page
 */
const DEFAULT_CATEGORY: Record<string, string> = {
  [Page.COLOR]: 'hex',
};

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

    this._pageStates = PAGES.reduce(
      (out, page) => ({
        ...out,
        [page]: new CategoryPageState(statefulProps, DEFAULT_CATEGORY[page] ?? ''),
      }),
      {} as typeof this._pageStates
    );

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
