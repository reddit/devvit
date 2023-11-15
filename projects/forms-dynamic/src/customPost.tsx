import { Devvit } from '@devvit/public-api';
import { configRulesForm, editRulesForm } from './forms.js';
import { loadRules, saveRules } from './redis.js';

Devvit.addCustomPostType({
  name: 'Dynamic Form',
  height: 'regular',
  render: ({ useForm, useState, ui, redis }) => {
    const rules = useState<string[]>(async () => await loadRules(redis));

    const setRules = async (_rules: string[]) => {
      rules[0] = _rules;
      rules[1](_rules);
      await saveRules(redis, _rules);
    };

    const editForm = useForm(editRulesForm, async (values) => {
      const rules: string[] = [];
      let nextIndex = 0;
      Object.entries(values).forEach(([name, value]) => {
        const idx = Number(name);
        while (idx > nextIndex) {
          rules.push('');
          nextIndex++;
        }
        rules.push(value);
        nextIndex++;
      });
      await setRules(rules);
    });

    const configForm = useForm(configRulesForm, ({ count }) => {
      const oldCount = rules[0].length;
      const newCount = Math.max(1, Math.min(10, count));
      let newRules: string[] = rules[0].slice();
      if (oldCount < newCount) {
        newRules = [...rules[0], ...new Array(newCount - oldCount).fill('')];
      } else if (oldCount > newCount) {
        newRules = rules[0].slice(0, newCount);
      }
      ui.showForm(editForm, { rules: newRules });
    });

    const configure = () => ui.showForm(configForm, { rules: rules[0] });

    const ruleText = rules[0].map((rule) => (
      <text color={rule ? 'black' : 'transparent'} selectable={!!rule}>
        {rule || '_'}
      </text>
    ));

    return (
      <vstack grow>
        <button onPress={configure}>Edit rules</button>
        {ruleText}
      </vstack>
    );
  },
});
