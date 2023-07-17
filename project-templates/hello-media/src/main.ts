import { Devvit, RichTextBuilder} from '@devvit/public-api';

Devvit.configure({media: true, redditAPI: true})

Devvit.addMenuItem({
    location: 'comment',
    label: "Reply with GIF",
    onPress: async (event, context) => {
     console.log(`Invoked action on comment ${event.targetId}`)
     try {
      const response = await context.media.upload({
        url: "https://media2.giphy.com/media/xTiN0CNHgoRf1Ha7CM/giphy.gif",
        type: "gif"
      });
      await context.reddit.submitComment(
          {
            id: event.targetId, // where context menu action was invoked
            text: 'Hello World with Media',
            richtext: new RichTextBuilder()
                 .image({mediaId: response.mediaId})
                 .codeBlock({}, (cb) => cb.rawText('This comment was created from a Devvit App'))
          }
        );
      } catch (err) {
        throw new Error(`Error uploading media: ${err}`);
      }
    },
});

export default Devvit;

