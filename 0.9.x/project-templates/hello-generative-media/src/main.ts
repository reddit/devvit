import { Devvit, RichTextBuilder} from '@devvit/public-api';

Devvit.configure({media: true, redditAPI: true, http: true})

interface GeneratedMedia {
  mediaUrl: string;
}

const getGeneratedImage = async (
  topic: string
):Promise<GeneratedMedia> => {
  const prompts = [
    "impressionist painterly oil on canvas",
    "photorealistic high resolution by award winning photographer",
    "abstract experimental",
    "impressionist painterly oil on canvas",
    "isometric 3d",
    "claymation",
    "medium resolution pixel art retro videogame inspired"
  ];
  const selectedPrompt = prompts[Math.floor(Math.random() * prompts.length)];
  console.log(`selected prompt for image generation: ${selectedPrompt}`);
  const res = await fetch("https://api.openai.com/v1/images/generations", {
      headers: {
        "Content-Type": "application/json",
        Authorization:
        // Replace with Open AI API Key
        // https://platform.openai.com/docs/api-reference/authentication
          "Bearer <auth-token>",
      },
      method: "POST",
      body: JSON.stringify({
        prompt: `high quality professional image of ${selectedPrompt} depicting ${topic}`,
        n : 1,
        size: `1024x1024`
      }),
    });
  const json = await res.json();
  const mediaUrl = json.data[0].url;
  return {mediaUrl};
};

Devvit.addMenuItem({
    location: 'comment',
    label: "Generate Image",
    onPress: async (event, context) => {
     console.log(`Invoked action on comment: ${event.targetId}`)
     try {
      // Fetch the comment
      const comment = await context.reddit.getCommentById(event.targetId)
      console.log(`comment text: ${comment.body}`)

      // Generate an image via Open AI
      const {mediaUrl} = await getGeneratedImage(comment.body)
      console.log(`mediaUrl for generated image: ${mediaUrl}`)

      // Upload the generated image to Reddit's media infrastructure
      const response = await context.media.upload({url: mediaUrl, type: "image"});

      // Create a richtext comment with media
      await context.reddit.submitComment(
          {
            id: event.targetId, //where context menu action was invoked
            text: 'Hello World with Media',
            richtext: new RichTextBuilder()
                 .image({mediaId: response.mediaId})
          }
        );
      } catch (err) {
        throw new Error(`Error uploading media: ${err}`);
      }
    },
});

export default Devvit;
