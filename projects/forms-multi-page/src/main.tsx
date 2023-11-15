// Visit developers.reddit.com/docs to learn Devvit!

import { Devvit, FormKey } from '@devvit/public-api';

const category: Record<string, string> = {
  food: 'kind',
  music: 'genre',
  sports: 'game',
};

const categories: Record<string, { label: string; value: string }[]> = {
  food: [
    { label: 'American', value: 'american' },
    { label: 'Chinese', value: 'chinese' },
    { label: 'Italian', value: 'italian' },
    { label: 'Mexican', value: 'mexican' },
  ],
  music: [
    { label: 'Alternative Rock', value: 'alternative' },
    { label: 'Classical', value: 'classical' },
    { label: 'Goa Trance', value: 'goa' },
    { label: 'Reggae', value: 'reggae' },
  ],
  sports: [
    { label: 'American Football', value: 'football' },
    { label: 'Baseball', value: 'baseball' },
    { label: 'Basketball', value: 'basketball' },
    { label: 'Soccer', value: 'soccer' },
  ],
};

Devvit.addCustomPostType({
  name: 'Multi-page Form',
  height: 'regular',
  render: ({ useState, useForm, ui }) => {
    const name = useState('');
    const subject = useState('');
    const favorite = useState('');

    const setName = (_name: string) => {
      name[0] = _name;
      name[1](_name);
    };

    const setSubject = (sub: string) => {
      subject[0] = sub;
      subject[1](sub);
    };

    const setFavorite = (fav: string) => {
      favorite[0] = fav;
      favorite[1](fav);
    };

    let formPage1: FormKey;
    let formPage2: FormKey;
    let formPage3: FormKey;
    formPage3 = useForm(
      () => ({
        title: `${name[0]}, what's your favorite ${category[subject[0]]} of ${subject[0]}?`,
        fields: [
          {
            type: 'select',
            label: category[subject[0]],
            name: 'category',
            options: categories[subject[0]],
          },
        ],
      }),
      ({ category }) => {
        setFavorite(category);
      }
    );
    formPage2 = useForm(
      () => ({
        title: `Hello, ${name[0]}`,
        fields: [
          {
            type: 'select',
            label: "What's your favorite subject?",
            name: 'subject',
            options: [
              { label: 'Food', value: 'food' },
              { label: 'Music', value: 'music' },
              { label: 'Sports', value: 'sports' },
            ],
          },
        ],
      }),
      ({ subject: _subject }) => {
        setSubject(_subject);
        ui.showForm(formPage3);
      }
    );
    formPage1 = useForm(
      {
        title: 'Questionnaire',
        fields: [{ type: 'string', label: "What's your name?", name: 'name' }],
      },
      ({ name: _name }) => {
        setName(_name);
        ui.showForm(formPage2);
      }
    );

    const launchForm = () => {
      ui.showForm(formPage1);
    };

    const restart = () => {
      setName('');
      setSubject('');
      setFavorite('');
      launchForm();
    };

    const unanswered = (
      <vstack alignment={'center middle'} grow>
        <button onPress={launchForm}>Take questionnaire</button>
      </vstack>
    );

    const answered = (
      <vstack alignment={'center middle'} gap={'medium'}>
        <text>Name: {name[0]}</text>
        <text>Favorite subject: {subject[0]}</text>
        <text>
          Favorite {category[subject[0]]}: {favorite[0]}
        </text>
        <spacer size={'large'} />
        <button onPress={restart}>Restart</button>
      </vstack>
    );

    return favorite[0] ? answered : unanswered;
  },
});

export default Devvit;
