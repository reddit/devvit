# Launch Your App

Once your app is ready, you can launch it to users and moderators across Reddit. This guide outlines what “launch-ready” means and the steps you need to take to submit your app for review.

Polished apps may also apply for **Reddit featuring**, which includes on-platform promotion and distribution support. Make sure to read [this guide](https://developers.reddit.com/docs/guides/launch/feature-guide) before submitting your app.

---

## When is an app ready to be launched?

Apps should be polished and stable before launch. Ensure your data schema is scalable and your UIs are clean and accessible, as **quality and performance directly impact organic distribution and adoption**.

Before submitting your app for review, be sure to:

- Test all functionality across mobile and web.
- Test from multiple accounts (developer, moderator, regular user), since permissions differ.
- Have a stable prototype with clear UX flows.

We also recommend getting feedback from the community:

- **All apps:**
  - [Cross-post](https://support.reddithelp.com/hc/en-us/articles/4835584113684-What-is-Crossposting) your post to r/Devvit using the **Feedback Friday** flair.
  - Share your app in the **#sharing** channel in the Reddit Devs Discord.
- **Games:**
  - Cross-post gameplay posts to r/GamesOnReddit with the **Feedback** flair.
- **Mod Apps:**
  - Share your app in the **#mod-discussion** Discord channel for moderator-specific feedback.

If your app is a **game**, ensure the experience:

- Works across platforms with responsive design.
- Includes a custom launch or first screen.
- Avoids inline scrolling (scrolling inside inline webviews is prohibited).
- Has a dedicated, non-test subreddit (e.g., [r/Pixelary](https://www.reddit.com/r/Pixelary/)).
- Is immediately understandable to new users.

Launching your app signals to Reddit’s algorithmic feeds that it is ready for broader distribution. Engagement — clicks, dwell time, and voting — determines your organic reach.

---

## How to launch an app

Apps are submitted for review through the CLI. To launch your app:

1. Add a user-friendly overview in your app’s `README.md`.
2. Run `npx devvit upload` for the version you want to launch.
3. Run `npx devvit publish`.

Once submitted, your app enters Reddit’s review queue. Our team evaluates your code, example posts, and app documentation.

You will receive email confirmation when your app is approved. If we need more information, a team member may contact you via Modmail or Reddit chat.

Because you must run `npx devvit publish` for **every version** you want to launch, we recommend batching updates into weekly (or less frequent) releases.

Review times vary. We aim to review most apps — especially version updates — within **1–2 business days**. New apps, apps with policy ambiguity, or apps using higher-risk features (e.g., payments, fetch) may require more time.  
If you haven’t heard from us after a week, please reach out in Discord or via r/Devvit Modmail.

Ensuring your app complies with all [Devvit Rules](https://developers.reddit.com/docs/devvit_rules) will streamline review.

**By default, published apps are unlisted**, meaning other communities cannot install them. This is ideal for games and community-specific tools.

---

## How to list your app for any community to install

If your app is a general-purpose moderation tool, community utility, or otherwise broadly applicable, you can request to list it in the [App Directory](https://developers.reddit.com/apps). Listing makes your app installable by any moderator.

Publicly listed apps must include a detailed `README.md` with:

- A comprehensive app overview.
- Installer-facing instructions.
- Changelogs for major updates.

To list your app:

1. Run `npx devvit publish --listed`
2. Once approved, it will appear in the Apps Directory for any community to install.

We do not recommend listing apps built for a single subreddit, as this may confuse moderators and clutter the directory.

---

## Resources

- Questions? Join our Discord or post in [r/Devvit](https://www.reddit.com/r/Devvit/).
- Review the [Devvit Rules](https://developers.reddit.com/docs/devvit_rules) before publishing.
- Learn more about [how to earn](../../earn-money/payments/payments_overview.md) from your apps.
