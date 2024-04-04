# Forms

Engage users by building interactive content.

There are two ways to add a form to your app, and the method you'll use depends on what you’re doing.

- For custom posts, the useForm method defines a form in a block, and the state is read and updated within the custom post.
- For menu actions, the createForm method adds a form to a menu option.

## Supported field types

| **Field**   | **Description**                                                    |
| ----------- | ------------------------------------------------------------------ |
| `string`    | A single-line text input.                                          |
| `select`    | A dropdown menu with predefined options.                           |
| `paragraph` | A multi-line text input for longer responses.                      |
| `number`    | An input for numerical values.                                     |
| `boolean`   | A yes/no or true/false type input.                                 |
| `group`     | A collection of related fields that allows for better readability. |

### Simple static forms

Forms can be defined with a simple Form object that takes a series of fields and an onSubmit handler.

```tsx
const myForm = Devvit.createForm({
fields: [
	{ name: 'nickname', label: 'Your nickname', type: 'string }
	// Any number of fields and groups
]
}, (values) => {
	console.log(values.nickname);
});
```

### Generated forms

You can also create forms by providing a `FormFunction`. This will allow you to define form fields dynamically.

```tsx
const myForm = Devvit.createForm(
  (data) => {
    // Grab the data, eventually returning form fields
    const todaysDate = data.todaysDate;

    // Return fields, same as static forms
    return [
      {
        name: 'startDate',
        label: 'Start Date',
        type: 'string',
        defaultValue: todaysDate,
      },
    ];
  },
  (values) => {
    // onSubmit handler
  }
);

Devvit.addMenuItem({
  label: 'Show a dynamic form',
  location: 'post',
  onPress: async (_, { ui }) => {
    const date = Date.now();
    ui.showForm(myForm, { date });
  },
});
```

### Chaining forms

```tsx
const pickAnimalForm = Devvit.createForm(
  { fields: [{ name: 'animal', label: 'Dogs or cats?', type: 'select' }] },
  (values) => {
    if (animal == 'dog') {
      ui.showForm(dogForm);
    } else {
      ui.showForm(catForm);
    }
    // onSubmit handler
  }
);

const dogForm = Devvit.createForm({});
const catForm = Devvit.createForm({});
```

## Custom post forms

You can use forms to capture user input and display it within a custom post. By using the useForm hook, you’re also able to manipulate state (`useState`) and use the values within blocks. You can try it out in a [play pen](https://developers.reddit.com/play#pen/N4IgdghgtgpiBcIQBoQGcBOBjBICWUADgPYYAuABMACIwBudeZAvhQGYbFQUDkAAgBN6jMgHpCAVwBGAGzxYAtBEJ4eAHTAasxMGkpYIZGAHNSAT3gUASjG0YBAHj0Y8YY8grPXxgHwUAvFQaFOzExAKWPADWrgI8yMEUUBJo8pHGMGAYMPGJaCTkaOnQOQlgzADcGlo6ehQGRqYuMEXWtqSOXm4ewBQyEFIwMpZdxhUUdBAyEjAjZC5uFMwA2gC6foHAiWxhERTLiSG9-YPDvACCsC4GYPETUzORJdcQt0tlIUd9A0ORAMIAC1cLVK92ms14WCBYBBPHehyo31OkQAkmQpnhXndJuDIkwMVj4WBPoiTr9eABZGAAD3kWI8OMevFgtJucOYHwoq05yVSWEsB2Jn2OPzOPHOMiMGEgZDwdBg1mIWCi2IeEJ4UylMrlOSJJJFyN4f36aD5U1VuMhJrNMnZnK+ZLFAHFiBAKAAVDCvLCgxnq0wQO0Ig3kng2YzGCC+tWRbIRqNBoXcvIFMitQX6pGhy4wF7EgBiYTIUimtoZMd4O2IxdLiczjsiACEIGgYCWZGWwUyeCXW+3bXrhVmxc20FEYDWOxbu73x5OBxzg8PIgBlJU+jDT9Vode5utcsqVapgWgMJgAOggAgEfxSZC4AAViHp3WZCDAABRbIWQWCRCkSJKeAKHoMCEBQhYYFAuRCtkYBCBglhfhQKQwCu6JGB4qGQVAWF4EsACUAR+N+JLaLolC-gqgSoehhifjwPAEVUQohORdRoNIABWtiUDRrZ0UYH6McxCLsZQbAQHQpBMNRKECRhDFMSxYm1JQrZkAAciUAQUB+AD6VFzAsxhEf4JEIiEVHLAADKsumGSULEklZJTLAAjKsBlUaJrFLCpfniZ4E4rtxvG6R+nFSMZ3hmRZfkhFFPFYGQtn2YEUXOS5SW8R5XlRb5JJHpogVqcFZD5lJMlGBFkl0DFbhxUECXsFVLhGGlul1VlJJ1dVMB5R+dWFZ8xUIjIE6hFBD4QBk7mWDhADSMBmD1fSTTs02zTAABMC2kFAy2reNG0HTNGQAMz7VBR1rZtUDnTAF26dhB0fpZelNV+H0hLKZATZYAAGAAkwDWXZHIUAA7gChg8GgFBmMQEgYK10ntQqoMNCY5jLDlKVpasrDEGwFCg-jqUQwA-ID9ouWweBDAI6Y-cKrMkmQb7bkMvEwS5-PLvU9FNGYeNhQTdnJi1-NGZCwvmHzAsksQhCyrUljY00jNoGLUjJZTqxS0rISLtLB4fcwBF0yEyGa+YhHEc1SsaZV6OyR+dsYGYI1FQiPtTQ9207S9rY4e9LUfl9pEC39AMUIDAASQwyMQHig+DRO06zDNMyzZtHOznyc++kSthNKWK8bgtqCAADqsNkPDiPI6jfUY544tkFTNfWwLsvw53lfGyrau6AKhf1qKkSFuEW6RFWcSDlXDpT5SKTyHPzLr1g+7L6Sq88CuqZoJv8PH7vxtG8bptK1fRVWx9yEU5Y+kUw75lOwLGmhXrvEGRT-sSQSDwOeNAAJiBQzDvdR6F1AFLD9ndM6213IhxgGHD60d+ax3VAARRmHoPAOhIB4GyEPXqjMZDMwFL0Yu255jeDuA2CgNd65wwRkjFGFAqLdxQFwkokQqLsjvqNXuyFZaOVgO-eKzsJzaVgN5EocCQjANAeAyBb1oFBzgcwBBx4yJlX6BIMAUIcIRSapgz4KiwEQKgUgua-sxqlQohQbIegIDkDMY7CxiVZElGEspD639O7+LgS7Nq7sRJrRCIY4xAIw4OICvo5xRjXhoChrmGAAgIofQcHQNxyoKAYmMGAWAYAyD+GADwH0ZTcxJDwNeCaPBWDGE4FDHwrMHBSAkGQe8xIdAPlcWgCpMSTEHWYD4d0EBxwUAAI74NHsQ7IDhRBdJ6TodpLVll5PRMqDZJJfKqWcak9J2QsmBHDvzXJ+SoiFLkMU0p5TKnVKlHUhpORmnKAqTwWAAg8ASGguMjpRhqRkB8HIiEYM3IQ2WcC0FQKaSgtdv1Duv8UqWGABTNKzAYUIr2QLBwsK8VKyRe3YAntRaYslswdFbdZJYo6aIQlHT8gQA3J4PAAAvGAXz+gYAyE0igogiUuU6d03pFB+mDIqa49E5Bxk2DceQZZqzenCpCFs65wqDl+WyGQFGxJaUdTshQKmhTdAnMyRQSwKTzUZIEFlU2lsAo0lTBQIQklAKUFPCIDQKAQDygwKkHQCB3LMCAA).

Here’s how to make a simple custom post that says “Hello.”

```tsx
import { Devvit } from '@devvit/public-api';

Devvit.addCustomPostType({
  name: 'Name',
  render: ({ useForm, useState, ui }) => {
    const [name, setName] = useState('Mysterious person');
    return (
      <vstack>
        <text>Hello {name}</text>
      </vstack>
    );
  },
});

export default Devvit;
```

Add a button that will change the name state value to whatever the user inputs.

```tsx
import {Devvit} from '@devvit/public-api'

Devvit.addCustomPostType({
  name: 'Name',
  render: ({ useForm, useState, ui }) => {
    const [name, setName] = useState('Mysterious person');

	// Form must be defined within the render method
    const nameForm = useForm({fields: [{ label: 'Name', type: 'string' name: 'name'}]}, (values) => {
	// Access the state setter here with setName
      setName(values.name);
    });

    return (
      <vstack>
        <text>Hello {name}</text>

	// Add a button which calls ui.showForm();
        <button onPress={() => { ui.showForm(nameForm) }}>Change name</button>
      </vstack>
    )
  }
})

export default Devvit
```

## Dynamic forms

Forms accept a data argument so you can pass in dynamic data.

Because we allow data as an argument in createForm, you can now create dynamic forms.

```tsx
import { Devvit } from '@devvit/public-api';

const dynamicForm = Devvit.createForm(
  (data) => {
    return {
      fields: [
        {
          name: 'when',
          label: `a string (default: ${data.text})`,
          type: 'string',
          defaultValue: data.text,
        },
      ],
      title: 'Rule Form',
      acceptLabel: 'Send Rule',
    };
  },
  ({ values }, ctx) => {
    return ctx.ui.showToast(`You sent ${values.when}`);
  }
);

Devvit.addMenuItem({
  label: 'Show a dynamic form',
  location: 'post',
  onPress: async (_, { ui }) => {
    const randomString = Math.random().toString(36).substring(7);

    const formData = {
      text: randomString,
    };

    return ui.showForm(dynamicForm, formData);
  },
});

export default Devvit;
```

## Examples

### Add a form to a menu action

```tsx
import { Devvit } from '@devvit/public-api';

const exampleForm = Devvit.createForm(
  (data) => ({
    fields: [
      {
        name: 'what',
        label: `What do you want us to call you, ${data.userId}?`,
        type: 'string',
        helpText: 'Do not include spaces in the name',
      },
      {
        name: 'who',
        label: 'which person should we bother?',
        type: 'select',
        options: [
          { label: 'me', value: 'me' },
          { label: 'you', value: 'you' },
          { label: 'someone else', value: 'someone else' },
        ],
      },
      {
        label: 'this is a group of options',
        type: 'group',
        fields: [
          {
            name: 'where',
            label: 'where should we bother them?',
            type: 'paragraph',
          },
          {
            name: 'numexample',
            label: 'how many tiimes should we call?',
            type: 'number',
          },
        ],
      },
      {
        name: 'yesno',
        label: 'is this a yes or a no?',
        type: 'boolean',
      },
    ],
    title: 'Example Form',
    acceptLabel: 'Submit',
    cancelLabel: 'Cancel',
  }),
  (event, context) => {
    console.log(event.values);
    context.ui.showToast('Thanks for submitting the form!');
  }
);

Devvit.addMenuItem({
  location: 'subreddit',
  label: 'Test the form',
  onPress: (event, context) => {
    context.ui.showForm(exampleForm, { userId: context.userId });
  },
});

export default Devvit;
```

### Add a multi-step dynamic form to a custom post

```tsx
import { Devvit } from '@devvit/public-api';

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
  name: 'Multi-step Form',
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
```
