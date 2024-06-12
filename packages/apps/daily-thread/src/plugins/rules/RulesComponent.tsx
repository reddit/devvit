import { BasicTextComponent } from '../../components/BasicTextComponent.js';
import type Devvit from '../../main.js';

export type RulesComponentProps = {
  rules: string;
};

export const RulesComponent: Devvit.BlockComponent<RulesComponentProps> = ({ rules }, context) => {
  return BasicTextComponent(
    {
      data: { title: 'Daily thread rules', description: rules },
      iconName: 'rules',
      iconBgColor: '#F6DDC3',
    },
    context
  );
};
