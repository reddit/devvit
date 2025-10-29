import { type PaymentsService, PaymentsServiceDefinition } from '@devvit/protos/payments.js';
import { Devvit } from '@devvit/public-api';

/** @internal */
export const paymentsPlugin: PaymentsService = Devvit.use(PaymentsServiceDefinition);

Devvit.addMenuItem({
  location: 'post',
  label: 'Get Payments Help',
  onPress: async (_, context) => {
    const url = new URL(
      'https://support.reddithelp.com/hc/en-us/requests/new?ticket_form_id=29770197409428&tf_29764567374740=devvit_product_not_working'
    );
    const username = await context.reddit.getCurrentUsername();
    // prefill reddit username
    if (username) {
      url.searchParams.append(`tf_360026362751`, username);
    }
    // prefill the post url
    const postId = context.postId;
    if (postId) {
      //remove the t3_ prefix
      const postWithoutPrefix = postId.replace('t3_', '');
      if (postWithoutPrefix) {
        const postUrl = `https://www.reddit.com/r/${context.subredditName}/comments/${postWithoutPrefix}`;
        url.searchParams.append(`tf_29770117862932`, postUrl);
      }
    }

    // subject with app name and app version
    url.searchParams.append(
      `tf_subject`,
      `[${context.appName} v${context.appVersion}] Payments Help`
    );

    // navigate to the url
    context.ui.navigateTo(url.toString());
  },
});
