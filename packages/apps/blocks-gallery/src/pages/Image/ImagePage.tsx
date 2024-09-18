import type { ContextAPIClients } from '@devvit/public-api';
import { Devvit } from '@devvit/public-api';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';

import type { CategoryPageState, CategoryProps } from '../../components/CategoryPage.js';
import { CategoryPage } from '../../components/CategoryPage.js';
import { Page } from '../page.js';
import { ImageResizePreview } from './ImageResizePreview.js';

type ImageMode = [string, Devvit.Blocks.ImageResizeMode];
type StackSize = [string, string];
type ImageBlockSize = [string, string];

export const ImagePage = ({
  state,
  context,
}: {
  state: CategoryPageState;
  context: ContextAPIClients;
}): JSX.Element => {
  const imageModes: ImageMode[] = [
    ['None', 'none'],
    ['Fit *', 'fit'],
    ['Fill', 'fill'],
    ['Cover', 'cover'],
    ['Scale Down', 'scale-down'],
  ];
  const stackSizes: StackSize[] = [
    ['Intrinsic', 'intrinsic'],
    ['Larger than Image Block', 'large'],
    ['Smaller than Image Block', 'small'],
  ];

  const imageBlockSizes: ImageBlockSize[] = [
    ['Same size as image', 'exact'],
    ['Larger than image', 'large'],
    ['Smaller than image', 'small'],
  ];

  const [stackSize, setStackSize] = context.useState('intrinsic');
  const [imageBlockSize, setImageBlockSize] = context.useState('exact');
  const [growImageBlock, setGrowImageBlock] = context.useState(false);
  const [reverse, setReverse] = context.useState(false);

  const configurePageForm = context.useForm(
    {
      fields: [
        {
          label: 'Stack size',
          type: 'select',
          name: 'stackSize',
          required: true,
          defaultValue: [stackSize],
          options: stackSizes.map((stackSize: StackSize) => ({
            label: stackSize[0],
            value: stackSize[1],
          })),
        },
        {
          label: 'Image Block size',
          type: 'select',
          name: 'blockSize',
          required: true,
          defaultValue: [imageBlockSize],
          options: imageBlockSizes.map((imageBlockSize: ImageBlockSize) => ({
            label: imageBlockSize[0],
            value: imageBlockSize[1],
          })),
        },
        {
          label: 'Grow image block?',
          type: 'boolean',
          name: 'growImageBlock',
          defaultValue: growImageBlock,
        },
        {
          label: 'Is Stack Reversed?',
          type: 'boolean',
          name: 'reverseStack',
          defaultValue: reverse,
        },
      ],
    },
    (values) => {
      setStackSize(values.stackSize[0]);
      setImageBlockSize(values.blockSize[0]);
      setGrowImageBlock(values.growImageBlock);
      setReverse(values.reverseStack);
    }
  );

  const configurePage = (): void => {
    context.ui.showForm(configurePageForm);
  };

  let stackString = 'Intrinsic stack';
  let stackHeight: number | undefined;
  let stackWidth: number | undefined;
  switch (stackSize) {
    case 'large':
      stackHeight = 320;
      stackWidth = 320;
      stackString = 'Large Stack';
      break;
    case 'small':
      stackHeight = 100;
      stackWidth = 100;
      stackString = 'Small Stack';
      break;
    default:
      break;
  }

  let imageBlockString = 'Exact Image Block';
  let imageBlockHeight: number = 192;
  let imageBlockWidth: number = 192;
  switch (imageBlockSize) {
    case 'large':
      imageBlockHeight = 280;
      imageBlockWidth = 300;
      imageBlockString = 'Large Image Block';
      break;
    case 'small':
      imageBlockHeight = 120;
      imageBlockWidth = 140;
      imageBlockString = 'Small Image Block';
      break;
    default:
      break;
  }

  const categories: CategoryProps[] = imageModes.map(([label, mode]) => ({
    label,
    category: mode,
    content: (
      <ImageResizePreview
        mode={mode}
        stackHeight={stackHeight}
        stackWidth={stackWidth}
        imageBlockHeight={imageBlockHeight}
        imageBlockWidth={imageBlockWidth}
        grow={growImageBlock}
        reverse={reverse}
      />
    ),
  }));

  const growString = growImageBlock ? ' - grow' : '';
  const reverseString = reverse ? ' - reverse' : '';
  const configuration = `${stackString} - ${imageBlockString}${growString}${reverseString}`;

  return (
    <CategoryPage
      state={state}
      categories={categories}
      activeCategory={state.category}
      onCategoryChanged={state.setCategory}
      onConfigureCategory={configurePage}
      title={StringUtil.capitalize(Page.IMAGES)}
      categoryConfigurationDescription={configuration}
    />
  );
};
