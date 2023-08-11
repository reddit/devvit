import { Devvit, RichTextBuilder} from '@devvit/public-api';

// Docs: https://developers.reddit.com/docs/media_uploads
Devvit.configure({media: true, redditAPI: true})


// Use Case: Create Rich-Text Comments with Media
Devvit.addMenuItem({
    location: 'comment',
    label: "Reply with GIF",
    onPress: async (event, context) => {
     console.log(`Invoked action on comment ${event.targetId}`)
     try {
      // Upload external media
      const response = await context.media.upload({
        url: "https://media2.giphy.com/media/xTiN0CNHgoRf1Ha7CM/giphy.gif",
        type: "gif"
      });

      // Create a comment with media
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

// Use Case: Create Rich-Text Posts with Media
Devvit.addMenuItem({
  location: 'subreddit',
  label: "Post with GIF",
  onPress: async (event, context) => {
    try {
       // Upload external media
       const response = await context.media.upload({
         url: "https://media2.giphy.com/media/xTiN0CNHgoRf1Ha7CM/giphy.gif",
         type: "gif"
       });

      // Get Subreddit
      const subreddit = await context.reddit.getSubredditById(event.targetId);

      // Create a post with media
      await context.reddit.submitPost(
        {
          subredditName: subreddit.name,
          title: 'Hello World with Media',
          richtext: new RichTextBuilder().image({mediaId: response.mediaId})
        });
    } catch (err) {
      throw new Error(`Error uploading media: ${err}`);
    }
  },
});


// Use Case: Create Native Image Posts in Reddit
Devvit.addMenuItem({
  location: 'subreddit',
  label: 'Post/Comment with Image',
  onPress: async (event, context) => {
    console.log(`Invoked action on subreddit ${event.targetId}`);
    try {
      const subreddit = await context.reddit.getSubredditById(event.targetId);
      const response = await context.media.upload({
        url: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Boulevard_du_Temple_by_Daguerre.jpg',
        type: 'image',
      });

      // In the future, we will support video and videogif types
      // Similar to https://www.reddit.com/dev/api/#POST_api_submit
      await context.reddit.submitPost({
        subredditName: subreddit.name,
        title: 'Hello World with Media',
        kind: 'image',
        url: response.mediaUrl
      });
    } catch (err) {
      throw new Error(`Error uploading media: ${err}`);
    }
  },
});


export default Devvit;

