import { Devvit } from '@devvit/public-api';
import { configRulesForm, editRulesForm } from './forms.js';
import { loadRules, saveRules } from './redis.js';

const configForm = Devvit.createForm(
  configRulesForm,
  async ({ values: { count } }, { redis, ui }) => {
    const rules = await loadRules(redis);
    const oldCount = rules.length;
    const newCount = Math.max(1, Math.min(10, count));
    let newRules: string[] = rules.slice();
    if (oldCount < newCount) {
      newRules = [...rules, ...new Array(newCount - oldCount).fill('')];
    } else if (oldCount > newCount) {
      newRules = rules.slice(0, newCount);
    }
    ui.showForm(editForm, { rules: newRules });
  }
);

const editForm = Devvit.createForm(editRulesForm, async ({ values }, { redis }) => {
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
  await saveRules(redis, rules);
});

Devvit.addMenuItem({
  location: 'subreddit',
  // forUserType: 'moderator',
  label: 'Edit Rules',
  onPress: async (_, { redis, ui }) => {
    const rules = await loadRules(redis);
    ui.showForm(configForm, { rules });
  },
});
