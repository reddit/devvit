import type { ContextAPIClients } from '@devvit/public-api';
import { Devvit } from '@devvit/public-api';
import type { CategoryPageState } from '../../components/CategoryPage.js';
import { CategoryPage } from '../../components/CategoryPage.js';
import { StackAlignmentPreview } from './StackAlignmentPreview.js';

export const StackAlignmentCategory = ({
  state,
  context,
}: {
  state: CategoryPageState;
  context: ContextAPIClients;
}): JSX.Element => {
  const subCategories = [
    ['Horizontal', 'horizontal'],
    ['Vertical', 'vertical'],
    ['Horiz + Vert', 'horizontal vertical'],
  ];

  const [stack, setStack] = context.useState('zstack');
  const [useLargeChild, setUseLargeChild] = context.useState(false);
  const [useChildPercentMeasurementUnit, setUseChildPercentMeasurementUnit] =
    context.useState(false);
  const [reverse, setReverse] = context.useState(false);

  const nameForm = context.useForm(
    {
      fields: [
        {
          label: 'Which stack?',
          type: 'select',
          name: 'stack',
          required: true,
          defaultValue: [stack],
          options: [
            { label: 'Z stack', value: 'zstack' },
            { label: 'H stack', value: 'hstack' },
            { label: 'V stack', value: 'vstack' },
          ],
        },
        {
          label: 'Is Stack larger than child?',
          type: 'boolean',
          name: 'childSize',
          defaultValue: !useLargeChild,
        },
        {
          label: 'Child measurement unit?',
          type: 'select',
          name: 'childMeasurement',
          defaultValue: [useChildPercentMeasurementUnit ? 'percent' : 'pixel'],
          options: [
            { label: 'Pixels', value: 'pixel' },
            { label: 'Percent', value: 'percent' },
          ],
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
      setStack(values.stack[0]);
      setUseLargeChild(!values.childSize);
      setUseChildPercentMeasurementUnit(values.childMeasurement[0] === 'percent');
      setReverse(values.reverseStack);
    }
  );

  const configureCategory = (): void => {
    context.ui.showForm(nameForm);
  };

  const childUnit = useChildPercentMeasurementUnit ? 'percent' : 'pixels';
  const childSize = useLargeChild ? 'large child' : 'small child';
  const reverseString = reverse ? ' - reverse' : '';
  const configuration = `${stack} - ${childSize} - ${childUnit}${reverseString}`;

  const content = subCategories.map(([label, subcategory]) => ({
    label,
    category: subcategory,
    content: (
      <StackAlignmentPreview
        mode={subcategory}
        stack={stack}
        reverse={reverse}
        isChildPercent={useChildPercentMeasurementUnit}
        isChildLarge={useLargeChild}
      />
    ),
  }));

  return (
    <CategoryPage
      state={state}
      subCategoryPage
      categories={content}
      activeCategory={state.subcategory}
      onCategoryChanged={state.setSubCategory}
      onConfigureCategory={configureCategory}
      title={configuration}
    />
  );
};
