import { Context, Devvit } from '@devvit/public-api';
import { Redis } from './Redis.js';

export class PinPost {
  context: Devvit.Context;
  postId: string;

  constructor(postId: string, context: Devvit.Context) {
    this.context = context;
    this.postId = postId;
  }

  async getPinPost() {
    const rdx = new Redis(this.context.redis);
    return rdx.pinPostGet(this.postId);
  }

  async updatePinPost(params: Parameters<Redis['pinPostUpdate']>[1]['params']) {
    const rdx = new Redis(this.context.redis);
    return rdx.pinPostUpdate(this.postId, { params });
  }

  async updatePinPostPin(
    pinId: string,
    params: Parameters<Redis['pinPostPinUpdate']>[2]['params']
  ) {
    const rdx = new Redis(this.context.redis);
    return rdx.pinPostPinUpdate(this.postId, pinId, { params });
  }

  /**
   * Creates a PinPost with a default config. Used as a convenience
   * helper compared to using the Redis class directly.
   */
  async createPinPost({
    username,
    title,
    url,
    header,
  }: {
    username: string;
    title: string;
    url: string;
    header: string;
  }) {
    const rdx = new Redis(this.context.redis);

    await rdx.pinPostCreate(this.postId, {
      params: {
        url,
        createdAt: new Date().toISOString(),
        createdBy: username,
        showBorder: true,
        title,
        header,
        subheader: '',
        owners: [username],
        featuredImage: 'devvit-logo.png',
        primaryColor: {
          light: '#FF4500',
          dark: null,
        },
        pins: [
          {
            id: 'events',
            type: 'events',
            enabled: false,
            pinTitle: 'Events',
            pinIcon: 'calendar',
            header: 'Events',
            subheader: 'Subscribe to upcoming community events',
            events: [],
          },
          {
            id: 'faqs',
            type: 'wiki',
            enabled: false,
            pinTitle: 'FAQ',
            pinIcon: 'help',
            header: 'FAQ',
            subheader: 'Answers to common questions',
            items: [],
          },
          {
            id: 'moderate',
            type: 'form',
            enabled: false,
            pinTitle: 'Moderate',
            pinIcon: 'mod',
            action: 'sendToMods',
            formName: 'Moderator Application',
            header: 'Moderator Application',
            subheader: 'Apply to join the subreddit mod team!',
            dedicatedPage: true,
            formAcceptLabel: 'Apply',
            formCancelLabel: '',
            formDescription: '',
            formTitle: 'Moderator Application',
            actionMeta: null,
            items: [
              {
                label: 'Question 1',
                name: 'q1',
                type: 'paragraph',
              },
              {
                label: 'Question 2',
                name: 'q2',
                type: 'paragraph',
              },
              {
                label: 'Question 3',
                name: 'q3',
                type: 'paragraph',
              },
            ],
          },
          {
            id: 'flair',
            type: 'flair',
            enabled: false,
            pinTitle: 'Flair',
            pinIcon: 'distinguish',
            formTitle: 'Submit Flair Text',
            includeLink: true,
            url: 'https://www.reddit.com/r/sports/wiki/flair/',
            header: 'Assign Flair',
            subheader: 'Follow this format to submit new flair text',
            image: '',
            body: [],
          },
          {
            id: 'linktree',
            type: 'wiki',
            enabled: false,
            pinTitle: 'Links',
            pinIcon: 'link',
            header: 'Links',
            subheader: 'Resources, links, affiliate communities',
            items: [],
          },
          {
            id: 'rules',
            type: 'wiki',
            enabled: false,
            pinTitle: 'Rules',
            pinIcon: 'rules',
            header: 'Rules',
            subheader: 'See the subreddit sidebar for more info',
            items: [],
          },
          {
            id: 'message',
            type: 'form',
            enabled: false,
            pinTitle: 'Message',
            pinIcon: 'message',
            action: 'sendToMods',
            formName: 'Contact Us',
            header: 'Contact Us',
            subheader: 'Send us a message.',
            dedicatedPage: false,
            formAcceptLabel: 'Send',
            formCancelLabel: '',
            formDescription: '',
            formTitle: 'Contact Us',
            actionMeta: null,
            items: [
              {
                type: 'string',
                label: 'Subject',
                name: 'subject',
              },
              {
                type: 'paragraph',
                label: 'Message',
                name: 'message',
              },
            ],
          },
        ],
        status: 'draft',
      },
    });
  }

  async clonePost(title: string) {
    const { reddit, ui } = this.context;
    const currentSubreddit = await reddit.getCurrentSubreddit();
    const currentUser = await reddit.getCurrentUser();
    const cloneCreator = currentUser.username;
    const subredditName = currentSubreddit.name;
    const pinPost = await this.getPinPost();
    const cloneCreated = new Date().toISOString();
    const post = await reddit.submitPost({
      title: title,
      subredditName,
      preview: (
        <vstack>
          <text color="black white">Loading...</text>
        </vstack>
      ),
    });

    const newPinParams = {
      ...pinPost,
      createdAt: cloneCreated,
      createdBy: cloneCreator,
      url: post.url,
      title,
    };

    const rdx = new Redis(this.context.redis);
    const newPinPost = await rdx.pinPostCreate(post.id, {
      params: newPinParams,
    });

    await reddit.sendPrivateMessage({
      to: newPinPost.createdBy,
      subject: 'Your post has been cloned',
      text: `View your cloned post: ${newPinPost.url}`,
    });
    ui.showToast('Post successfully cloned! Check your messages.');

    /*
    I think I want to return the old pinpost not the new pin post?
    so I'm not overwriting the old post settings on re-render
     */

    return pinPost;
  }
}
