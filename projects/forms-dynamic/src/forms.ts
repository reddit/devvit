import { FormFunction } from '@devvit/public-api';

export const configRulesForm: FormFunction = ({ rules }) => ({
  title: 'Configure Rules',
  fields: [
    {
      type: 'number',
      label: 'Number of rules',
      helpText: 'Must be between 1 and 10',
      name: 'count',
      defaultValue: rules.length,
      required: true,
    },
  ],
});

export const editRulesForm: FormFunction = ({ rules }) => ({
  title: 'Edit Rules',
  fields: rules.map((rule: string, idx: number) => ({
    type: 'string',
    label: `Rule #${idx + 1}`,
    name: `${idx}`,
    defaultValue: rule,
  })),
});
