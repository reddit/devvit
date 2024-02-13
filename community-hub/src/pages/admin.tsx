import { Devvit } from '@devvit/public-api';
import { feedbackAccount } from '../constants.js';
import { PageProps } from '../types/page.js';
import { standardizeUsername } from '../util.js';
import { Page } from '../components/Page.js';

export const AdminPage = ({
  context,
  pinPost,
  pinPostMethods: { updatePinPost, clonePost },
  navigate,
  currentUserUsername,
}: PageProps) => {
  const { useForm } = context;

  const colorForm = useForm(
    () => {
      return {
        fields: [
          {
            name: 'light',
            label: `Color`,
            type: 'string',
            defaultValue: pinPost.primaryColor.light,
          },
        ],
        title: 'Update the Post Color',
        acceptLabel: 'Update',
      };
    },
    async (data) => {
      await updatePinPost({
        primaryColor: {
          ...pinPost.primaryColor,
          ...data,
        },
      });
      context.ui.showToast(`${data.light} is now your post theme color!`);
    }
  );

  const modifyOwnerForm = context.useForm(
    () => {
      return {
        fields: [
          {
            name: 'nameAdd',
            label: `Add user`,
            type: 'string',
          },
          {
            name: 'nameRemove',
            label: `Remove user`,
            type: 'string',
          },
        ],
        title: 'Who can manage this post?',
        acceptLabel: 'Submit',
      };
    },
    async (data) => {
      const { reddit } = context;
      const addData = data.nameAdd as string;
      const removeData = data.nameRemove as string;

      const newOwners = new Set([...pinPost.owners]);

      const subname = await (await reddit.getSubredditById(context.subredditId!)).name;
      if (addData) {
        const add = standardizeUsername(addData);
        if (newOwners.has(add)) {
          context.ui.showToast(`${add} is already an owner!`);
          return;
        }

        await reddit.sendPrivateMessage({
          to: add,
          subject: "You've been added to a Community Hub",
          text: `You can now manage the ${subname} pinned post here: ${pinPost.url}`,
        });
        context.ui.showToast(`${add} is now a post owner!`);
        newOwners.add(add);
      }

      if (removeData) {
        const remove = standardizeUsername(removeData);
        if (newOwners.size < 2) {
          context.ui.showToast(`You must have 1 post owner`);
          return;
        }

        context.ui.showToast(`${remove} can no longer manage this post`);
        newOwners.delete(remove);
      }

      await updatePinPost({
        owners: [...newOwners],
      });
    }
  );

  const imageForm = context.useForm(
    () => {
      return {
        fields: [
          {
            name: 'url',
            label: `URL`,
            type: 'string',
            defaultValue: 'Must Reddit image link i.e. https://i.redd.it/0ujuzl4ki7yb1.png',
          },
        ],
        title: 'Update the home image',
        acceptLabel: 'Update',
      };
    },
    async (data) => {
      await updatePinPost({
        featuredImage: data.url,
      });
      context.ui.showToast(`Your home image has been updated!`);
    }
  );

  //clone form
  const cloneConfirm = context.useForm(
    () => {
      return {
        fields: [
          {
            name: 'confirm',
            label: `Write "CLONE" to confirm`,
            type: 'string',
          },
          {
            name: 'title',
            label: `Title`,
            type: 'string',
          },
        ],
        title: 'Duplicate your post',
        acceptLabel: 'Clone',
      };
    },
    async (data) => {
      const { ui } = context;
      const confirm = data.confirm || '';
      const title = data.title || '';
      if (confirm === 'CLONE') {
        try {
          await clonePost(title);
        } catch (e) {
          ui.showToast(`failed to clone post: ${e}`);
        }
      } else {
        ui.showToast(`You must write "CLONE" to duplicate post`);
      }
    }
  );

  const deleteConfirm = context.useForm(
    () => {
      return {
        fields: [
          {
            name: 'confirm',
            label: `Write "DELETE" to confirm`,
            type: 'string',
          },
        ],
        title: 'Are you sure you want to delete this post?',
        acceptLabel: 'Delete',
      };
    },
    async (data) => {
      const { reddit, ui } = context;
      const postId = context.postId;
      if (!postId) {
        ui.showToast(`failed to delete post: no postId`);
        return;
      }
      const confirm = data.confirm || '';
      if (confirm === 'DELETE') {
        try {
          await (await reddit.getPostById(postId)).delete();
          ui.showToast(`Post successfully deleted`);
        } catch (e) {
          ui.showToast(`failed to delete post: ${e}`);
        }
      } else {
        ui.showToast(`You must write "DELETE" to remove the post`);
      }
    }
  );

  const feedbackForm = context.useForm(
    () => {
      return {
        fields: [
          {
            name: 'feedback',
            label: `Feedback`,
            defaultValue: 'Add your feedback or request. Please note, feedback is not anonymous.',
            type: 'paragraph',
          },
        ],
        title: 'Community Hub Feedback',
        acceptLabel: 'Send to Developer',
      };
    },
    async (data) => {
      const { reddit, ui } = context;
      const feedback = data.feedback || '';
      await reddit.sendPrivateMessage({
        to: feedbackAccount,
        subject: 'Community Hub Feedback',
        text: `
From: ${currentUserUsername}
Feedback: ${feedback}
          `,
      });
      ui.showToast('Feedback sent!');
    }
  );

  const addImage: Devvit.Blocks.OnPressEventHandler = async () => {
    context.ui.showForm(imageForm);
  };

  const addColor: Devvit.Blocks.OnPressEventHandler = async () => {
    context.ui.showForm(colorForm);
  };

  const addOwner: Devvit.Blocks.OnPressEventHandler = async () => {
    context.ui.showForm(modifyOwnerForm);
  };

  const clonePInfo: Devvit.Blocks.OnPressEventHandler = async () => {
    context.ui.showForm(cloneConfirm);
  };

  const deletePInfo: Devvit.Blocks.OnPressEventHandler = async () => {
    context.ui.showForm(deleteConfirm);
  };

  const sendFeedback: Devvit.Blocks.OnPressEventHandler = async () => {
    context.ui.showForm(feedbackForm);
  };

  const editConfig: Devvit.Blocks.OnPressEventHandler = async () => {
    navigate('admin:configure');
  };

  return (
    <Page>
      <Page.Content navigate={navigate}>
        <vstack alignment="top center">
          <hstack alignment="center">
            <text color="black white" size="xlarge" weight="bold">
              Manage Hub
            </text>
          </hstack>
          <spacer size="medium" />
          <text color="black white" size="small" wrap>{`Owners: ${pinPost.owners.join(
            ', '
          )}`}</text>
          <spacer size="small" />
          <hstack alignment="center" gap="small" maxWidth={'70%'} width={'100%'}>
            <vstack grow gap="small">
              <button onPress={addOwner} size="small" icon="mod" appearance="secondary">
                Owners
              </button>
              <button onPress={editConfig} size="small" icon="toggle" appearance="secondary" grow>
                Configure
              </button>
              <button
                onPress={clonePInfo}
                size="small"
                icon="duplicate"
                appearance="secondary"
                grow
              >
                Clone
              </button>
            </vstack>
            <vstack grow gap="small">
              <button onPress={deletePInfo} size="small" icon="delete" appearance="secondary" grow>
                Delete
              </button>
              <button onPress={sendFeedback} size="small" icon="inbox" appearance="secondary" grow>
                Feedback
              </button>
              {/* <button
                onPress={addOwner}
                size="small"
                icon="code-block"
                appearance="secondary"
                grow
              >
                GitHub Repo
              </button> */}
              <button onPress={addColor} size="small" icon="topic-art" appearance="secondary" grow>
                Color
              </button>
            </vstack>
          </hstack>
          <spacer size="small" />
          <button onPress={addImage} size="small" icon="image-post" appearance="secondary" grow>
            Image
          </button>
        </vstack>
      </Page.Content>
    </Page>
  );
};
