import { ALL_ICON_NAMES, Devvit, FormKey, UIClient, UseStateResult } from '@devvit/public-api';
import IconSize = Devvit.Blocks.IconSize;

const PAGE_SIZE = 10;
const TOTAL_PAGES = Math.ceil(ALL_ICON_NAMES.length / PAGE_SIZE);

export type GallerySharedProps = {
  gallery: Gallery;
};

export class Gallery {
  readonly #ui: UIClient;

  readonly #currentIconsState: UseStateResult<string[]>;
  readonly #totalPagesState: UseStateResult<number>;
  readonly #currentPageState: UseStateResult<number>;
  readonly #currentColorState: UseStateResult<string>;
  readonly #currentSizeState: UseStateResult<string>;
  readonly #customizeDialogVisible: UseStateResult<boolean>;
  readonly #customizeSize: UseStateResult<string>;
  readonly #customizeColor: UseStateResult<string>;
  readonly #filterTextState: UseStateResult<string>;

  readonly #customColorForm: FormKey;
  readonly #filterTextForm: FormKey;

  readonly #allIcons = ALL_ICON_NAMES.map((name) => name).sort();

  constructor(context: Devvit.Context) {
    const { useState, useForm, ui } = context;

    this.#ui = ui;

    this.#totalPagesState = useState(TOTAL_PAGES);
    this.#currentPageState = useState(0);
    this.#currentColorState = useState('');
    this.#currentSizeState = useState('medium');
    this.#customizeDialogVisible = useState(false);
    this.#customizeSize = useState('medium');
    this.#customizeColor = useState('');
    this.#filterTextState = useState('');

    this.#currentIconsState = useState<string[]>(this.getFilteredIcons);

    this.#customColorForm = useForm(
      {
        title: 'Enter a color string',
        fields: [
          {
            type: 'string',
            name: 'color',
            label: 'Color:',
            defaultValue: this.customizeColor,
          },
        ],
        acceptLabel: 'Use',
      },
      (values) => {
        this.customizeColor = values['color'].trim();
      }
    );

    this.#filterTextForm = useForm(
      {
        title: 'Filter by text',
        fields: [
          {
            type: 'string',
            name: 'text',
            label: 'Contains:',
            defaultValue: this.filterText,
          },
        ],
      },
      (values) => {
        this.filterText = values['text'];
        this.applyFilters();
      }
    );
  }

  nextPage = (): void => {
    this.currentPage++;
  };

  prevPage = (): void => {
    this.currentPage--;
  };

  openCustomizeDialog = (): void => {
    this.customizeColor = this.currentColor;
    this.customizeSize = this.currentSize;
    this.customizeDialogVisible = true;
  };

  closeCustomizeDialog = (): void => {
    this.customizeDialogVisible = false;
  };

  saveCustomizations = (): void => {
    this.currentColor = this.customizeColor;
    this.currentSize = this.customizeSize;
    this.closeCustomizeDialog();
  };

  setColor = (color: string) => {
    return () => {
      this.customizeColor = color;
    };
  };

  openCustomColorForm = (): void => {
    this.#ui.showForm(this.#customColorForm);
  };

  openFilterTextForm = (): void => {
    this.#ui.showForm(this.#filterTextForm);
  };

  clearFilterText = (): void => {
    this.filterText = '';
    this.applyFilters();
  };

  clearCustomColor = (): void => {
    this.customizeColor = '';
  };

  applyFilters = (): void => {
    this.currentPage = 0;
    this.filterText = this.filterText.trim().toLowerCase();
    this.icons = this.getFilteredIcons();
    this.pageCount = Math.ceil(this.#currentIconsState[0].length / PAGE_SIZE);
  };

  get pageStart(): number {
    return this.currentPage * PAGE_SIZE;
  }

  get pageEnd(): number {
    return this.pageStart + PAGE_SIZE;
  }

  get pageCount(): number {
    return this.#totalPagesState[0];
  }

  set pageCount(value: number) {
    this.#totalPagesState[0] = value;
    this.#totalPagesState[1](value);
  }

  get currentPage(): number {
    return this.#currentPageState[0];
  }

  set currentPage(value: number) {
    this.#currentPageState[1](value);
  }

  get isFirstPage(): boolean {
    return this.currentPage === 0;
  }

  get isLastPage(): boolean {
    return this.currentPage === this.pageCount - 1;
  }

  get currentColor(): string {
    return this.#currentColorState[0];
  }

  set currentColor(value: string) {
    this.#currentColorState[1](value);
  }

  get currentSize(): IconSize {
    return this.#currentSizeState[0] as IconSize;
  }

  set currentSize(value: string) {
    this.#currentSizeState[1](value);
  }

  get customizeDialogVisible(): boolean {
    return this.#customizeDialogVisible[0];
  }

  get customizeSize(): IconSize {
    return this.#customizeSize[0] as IconSize;
  }

  set customizeSize(value: string) {
    this.#customizeSize[1](value);
  }

  get customizeColor(): string {
    return this.#customizeColor[0];
  }

  set customizeColor(value: string) {
    this.#customizeColor[1](value);
  }

  set customizeDialogVisible(value: boolean) {
    this.#customizeDialogVisible[1](value);
  }

  get filterText(): string {
    return this.#filterTextState[0];
  }

  set filterText(value: string) {
    this.#filterTextState[0] = value;
    this.#filterTextState[1](value);
  }

  get currentPageLabel(): string {
    return `Page ${this.currentPage + 1} of ${this.pageCount}`;
  }

  get currentIconCountLabel(): string {
    const len = this.#currentIconsState[0].length;
    return `${len} icon${len === 1 ? '' : 's'}`;
  }

  get currentSearchLabel(): string {
    return this.filterText ? `"${this.filterText}"` : 'Search for icons';
  }

  get icons(): string[] {
    return this.#currentIconsState[0].slice(this.pageStart, this.pageEnd);
  }

  set icons(value: string[]) {
    this.#currentIconsState[0] = value;
    this.#currentIconsState[1](value);
  }

  getFilteredIcons = (): string[] => {
    return this.#allIcons.filter((name: string) => {
      let pass = true;
      if (this.filterText) {
        pass = name.includes(this.filterText);
      }
      return pass;
    });
  };
}
