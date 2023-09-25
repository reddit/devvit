import { Devvit } from '@devvit/public-api';
import { indentXML, xmlToJsx } from './util.js';

// Define what packages you want to use here
// Others include:
// kvStore: a simple key value store for persisting data across sessions within this installation
// media: used for importing and posting images
Devvit.configure({
  redditAPI: true, // context.reddit will now be available
});

const base = (
  <blocks height="regular">
    <vstack grow alignment="middle center">
      loading...
    </vstack>
  </blocks>
);

/*
 * Use a menu action to create a custom post
 */
Devvit.addMenuItem({
  label: 'New Playground',
  location: 'subreddit',

  onPress: async (_, { reddit, ui }) => {
    try {
      const subreddit = await reddit.getCurrentSubreddit();

      /*
       * Submits the custom post to the specified subreddit
       */
      await reddit.submitPost({
        preview: base,
        title: `${subreddit.name} Playground`,
        subredditName: subreddit.name,
      });

      ui.showToast({
        text: `Successfully created a Playground!`,
        appearance: 'success',
      });
    } catch (error) {
      ui.showToast({
        text: `Failed to create: ${error}`,
        appearance: 'neutral',
      });
    }
  },
});

const defaultContent = indentXML(
  `<vstack grow="true" alignment="middle center"><text color="red">Tap anywhere!!</text></vstack>`
);

Devvit.addCustomPostType({
  name: 'Playground',
  render: ({ useState, useForm, ui }) => {
    const [content, setContent] = useState(defaultContent);
    const form = useForm(
      {
        fields: [
          {
            type: 'paragraph',
            name: 'content',
            label: 'Content',
            defaultValue: content,
          },
        ],
      },
      (values) => {
        setContent(indentXML(values.content));
      }
    );
    return (
      <vstack grow onPress={() => ui.showForm(form)}>
        {xmlToJsx(content)}
      </vstack>
    );
  },
});

export default Devvit;
