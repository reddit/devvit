# Guidelines

Your app must comply with all applicable Reddit policies, which include the Reddit [Developer Terms](https://www.redditinc.com/policies/developer-terms) and [Data API Terms](https://www.redditinc.com/policies/data-api-terms), as well as our [User Agreement](https://www.redditinc.com/policies/), [Privacy Policy](https://www.reddit.com/policies/privacy-policy), [Content Policy](https://www.redditinc.com/policies/content-policy) and [Advertising Policy](https://redditinc.force.com/helpcenter/s/article/Reddit-Advertising-Policy-Restricted-Advertisements) (“Reddit Terms & Policies”). Based on these policies, Reddit may review your app prior to hosting it, and/or take enforcement actions ranging from temporary suspension to permanent removal of your app, blocking your access to Reddit's Developer Platform, or suspending your developer account.

## Copycats

We want apps built on Reddit’s Developer Platform to be unique and solve real use cases for communities and their users.

Apps should:

- **Be original and innovative.** We know you have great ideas and can’t wait to see how you introduce new features or improve existing ones in a meaningful way.
- **Respect intellectual property.** Be fair to others. Don’t copy code, UI, images, or logos from other apps without permission and respect existing trademarks.
- **Not cause confusion.** Apps that impersonate another app, developer, or service are prohibited. This includes cloning apps or suggesting that an app is another app that already exists.

Copycat apps that violate any of these guidelines are subject to removal from the portal at any time, and developers who egregiously violate these policies may be removed from the program.

:::note
If you believe an app is in violation of any of the guidelines above, please report it to the Developer Platform team.
:::

## User-generated content

Apps that accept and display user-generated content (UGC) need to follow Reddit’s broader guidelines around UGC. When an app accepts UGC, it should create a new post or comment with the UGC author clearly identified as the author of the submitted content.

:::note
New content will be posted as the app account until the app has been approved by the Developer Platform team. After that, submitPost will post on behalf of the UGC author.
:::

### Live posts

If an app allows users to create UGC by interacting with a live post (for example, a form submission that modifies live content), the app should limit the forms of expression available to prevent potential abuse. Appropriate examples of limited expression include:

- Emojis
- Predefined dictionaries (like stock ticker symbols or a safe dictionary)

Avoid allowing free-form text input for user interactions with UGC to minimize the risk of abuse.

### Deleting user content

Apps should adhere to the [content deletion policy](#content-deletion-policy), ensure that users have the ability to remove their own content when desired, and that the app complies with any legal requirements related to content removal.

Being able to safely accept UGC is a key criteria during app review. If there are apps that you feel require exceptions to these guidelines please reach out.

## Content deletion policy

You are required to remove any user content that has been deleted from Reddit from your Devvit app. We provide access to post and comment delete events via [triggers](https://developers.reddit.com/docs/event_triggers) to help facilitate this.

On `PostDelete` and `CommentDelete` event triggers, you must delete all content related to the post and/or comment (for example, title, body, embedded URLs, etc.) from your app. This includes data that is in the Redis/KVstore and data sent to an external service. Metadata required for contextualizing related content (for example, post or comment ID, createdAt, etc.) may be retained.

When a user account is deleted, the related user ID (t2\_\*) must be completely removed from your hosted datastores (e.g. Redis) and any external systems. You must also delete all references to the author-identifying information (i.e. the author ID, name, profile URL, avatar image URL, user flair, etc.) from posts and comments created by that account. You may continue to keep posts and comments created by deleted accounts, provided that the posts and comments have not been explicitly deleted.

To best comply with this policy, we recommend deleting any stored user data within 30 days. For any data you are storing in Redis, you can use the [expire function](./capabilities/redis.md#key-expiration) to ensure data gets deleted automatically.

:::note
Retention of content and data that has been deleted, even if disassociated, de-identified or anonymized, is a violation of our terms and policies.
:::

## Using external sites or services in Devvit Apps

If your app links to any third-party site that may collect redditor personal data or that facilitates financial transactions, you are solely responsible for verifying the legitimacy and security of the third-party site(s) and should ensure that they are in compliance with all applicable laws. For example, you should ensure that:

- a charitable organization collecting donations is registered as a 501(c)(3) organization (or local equivalent) and provides necessary tax receipts;
- a site collecting personal data provides a privacy policy that clearly discloses what data is collected, how the data is used, and how the data is shared.

Additionally, to the extent that you intend to include links to such third-party sites, you must provide your own terms of service and privacy policy.

## Using Large Language Models in Devvit Apps

Your Devvit apps can use approved Large Language Models (“LLMs”) via fetch functionality, provided your app adheres to the following guidelines as well as all applicable Reddit terms and policies, including our [Developer Terms](https://www.redditinc.com/policies/developer-terms) and [Developer Data Protection Addendum](https://www.redditinc.com/policies/developer-dpa), as well as our [User Agreement](https://www.redditinc.com/policies/), [Privacy Policy](https://www.reddit.com/policies/privacy-policy), [Content Policy](https://www.redditinc.com/policies/content-policy), [Public Content Policy](https://support.reddithelp.com/hc/en-us/articles/26410290525844-Public-Content-Policy), and [Advertising Policy](https://redditinc.force.com/helpcenter/s/article/Reddit-Advertising-Policy-Restricted-Advertisements) (collectively, “Reddit Rules”). Your app:

- Provides significant and unique benefits to redditors and Reddit communities;
- Uses one of the approved LLMs listed below;
- Does not use Reddit data to create, improve, modify, train, or fine-tune any generative AI, LLM, ML, or NLP models (collectively, “Model Training”);
- Does not provide access to or otherwise enable any third party to use Reddit data for Model Training;
- Includes terms of services and a privacy policy for handling Reddit data; and
- Adheres to all other rate limits and guidelines as outlined in our [Developer Terms](https://www.redditinc.com/policies/developer-terms) and other Reddit Rules.

### Approved LLMs:

Below are the only LLMs approved by Reddit for use:

- Google LLMs (e.g., Gemini)
- OpenAI LLMs (e.g., ChatGPT)

For the avoidance of doubt, self-hosted and other LLMs (e.g. Llama, Mistral) are not approved for use at this time.

Reddit reserves the right to update these guidelines, including our list of approved LLMs, at any time and at our discretion. As always, it is your responsibility to ensure your app is compliant with the Reddit Rules and our latest guidelines.

## Devvitquette

Do:

- Remember the human, community, and your fellow devs
  - Build with the ecosystem in mind - provide discrete functionality and always try to add value
  - Be reliable - maintain work that communities rely on, communicate when you cannot, and make it easy to contact you for support
  - Provide transparency - use clear naming and descriptions that accurately describe your app's functionality, purpose, and data practices
  - Respect Redditors' data and privacy - make sure you get consent and appropriate permissions before processing data, or taking any actions (automated or not) on Redditors' behalf; and only use the necessary data for your app's stated functionality
  - make sure your app complies with our [moderator code of conduct](https://www.redditinc.com/policies/moderator-code-of-conduct)
- Facilitate successful deployment
  - Consider inclusion/exclusion lists if your app is not installed on the subreddit level
  - Test your app locally and in sandbox subreddits when applicable
- Let us know if your app is compromised (e.g., data breach, unauthorized access)

Don’t:

- Break any rule outlined in Reddit’s Terms & Policies - make sure your app doesn't:
  - Facilitate, promote nor amplify any form of harassment, violence or hateful activities
  - Engage in nor enable the manipulation of Reddit's features (e.g., voting, karma) or the circumvention of safety mechanisms (e.g., user blocking, account bans)
  - Promote deceptive content (e.g., spam, malware) nor facilitate adverse actions that may interfere with the normal use of Reddit (e.g., introducing malicious code or programs that violate Reddit Terms & Policies)
  - Mislead Redditors about your relationship with Reddit or any other person or entity
  - Infringe on others' intellectual property rights, nor make it easier to violate others' privacy
  - Enable the distribution of harmful content or the facilitation of illegal or legally restricted activities
  - Expose Redditors to graphic, sexually-explicit, or offensive content without proper labeling
  - Allow others to break any of the rules in Reddit Terms & Policies
- Write programs that respond to generic words or event types
- Create an app or functionality for use in or that targets services in a prohibited or regulated industry such as (but not limited to) gambling, healthcare, financial and cryptocurrency products and services, political advertisement, alcohol, recreational drugs, or any other restricted category listed in the [Reddit Advertising Policy](https://redditinc.force.com/helpcenter/s/article/Reddit-Advertising-Policy-Restricted-Advertisements)
- Process account data to infer Redditors' personal characteristics, such as racial or ethnic origin, political opinions, religious or philosophical beliefs, union membership, genetics or biometrics, health, sex life, or sexual orientation
- Gather intelligence nor attempt to track Redditors or Reddit content for the purpose of surveillance, and/or to provide that information to governments or other entities conducting surveillance
- Intrude on Redditors' privacy and autonomy in spaces your app isn't authorized to access or moderate
- Request that Redditors share their login credentials or any other personal information to access or complete any action through your app
- Attempt to publish an app targeting anyone under 13 -- Redditors must all be over the age of 13 to use the platform!
- Attempt to circumvent any safety or security enforcement measures Reddit may have taken, including against your app
