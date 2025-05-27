# Devvit Rules

## Overview

Welcome to Reddit’s Developer Platform (or “**Devvit**”)! Before you build, please read these Devvit Rules along with Reddit’s [Developer Terms](https://www.redditinc.com/policies/developer-terms). We want you and your Devvit app(s) to succeed, and our policies and developer documentation are designed to enable you to provide a fun, safe, and trusted experience for all redditors. We expect you to be honest about your app(s), and to respect the privacy, safety, and other rights of redditors.

You must comply with: these Devvit Rules and Reddit’s [Developer Terms](https://www.redditinc.com/policies/developer-terms), [Developer Data Protection Addendum](https://www.redditinc.com/policies/developer-dpa), and [Data API Terms](https://www.redditinc.com/policies/data-api-terms); our [User Agreement](https://www.redditinc.com/policies/), [Econ Terms](https://www.redditinc.com/policies/econ-terms), [Previews Terms](https://www.redditinc.com/policies/previews-terms), [Privacy Policy](https://www.reddit.com/policies/privacy-policy), [Public Content Policy](https://support.reddithelp.com/hc/en-us/articles/26410290525844-Public-Content-Policy), [Reddit Rules](https://www.redditinc.com/policies/reddit-rules) and [Advertising Policy](https://redditinc.force.com/helpcenter/s/article/Reddit-Advertising-Policy-Restricted-Advertisements); and all other policies and developer documentation governing the use of our developer services (collectively, “**Reddit Terms & Policies**”). We may update Reddit Terms & Policies from time to time, so please check in and review them regularly.

## Reddit App Review

Your app is subject to our App Review and approval. Reddit may reject or remove any app that violates these Devvit Rules or any other Reddit Terms & Policies at our discretion. We may also suspend or ban accounts tied to developers who violate these Devvit Rules or any other Reddit Terms & Policies.

These Devvit Rules are intended to clarify how we review Devvit apps and streamline the process for you and Reddit. Our goal is to keep redditors safe and enable developers to build fun and useful apps for redditors. This means our Devvit Rules may evolve over time, which you should keep in mind when building or updating your app. Please [reach out](https://developers.reddit.com/docs/help) if you have any questions on these Devvit Rules. Any exceptions to these Devvit Rules or any other Reddit Terms & Policies must be approved in writing by Reddit.

You can use Devvit and test your app without needing to submit it to Reddit’s App Review. However, to make your app visible in the [Reddit App Directory](https://developers.reddit.com/apps) and publicly available for other mods and admins to install, you’ll need prior app approval. Additionally, if you want to unlock premium features for your app (for example, [payments](https://developers.reddit.com/docs/capabilities/payments), [fetching](https://developers.reddit.com/docs/capabilities/http-fetch), [interactive posts](https://developers.reddit.com/docs/interactive_posts), or [using LLMs](#generative-aillm-rules)), you’ll also need prior app approval.

You can start the Reddit App Review process by [publishing your app](https://developers.reddit.com/docs/publishing). Before starting Reddit App Review, we recommend:

- Thoroughly playtesting your app,
- Carefully reviewing these Devvit Rules and other Reddit Terms & Policies, and
- Providing a detailed app description.

As part of Reddit App Review, we may review your code, read through your app’s description, test your app, and provide feedback. When your app review is complete, we’ll notify you about your app’s status, which could be:

- Approved
- Approved with non-blocking feedback
- Rejected with feedback on how to get your app approved
- Rejected due to a violation of Devvit Rules or other Reddit Terms & Policies

Our app review process typically takes approximately one week from receipt of a complete submission, but may take longer depending on app review volumes or complexity of a given app. We aim to promptly review all apps but cannot guarantee a specific review time, particularly if your app seeks to unlock premium features. Our Devvit Rules and Reddit Terms & Policies are also evolving, which can impact the status of previously reviewed apps. Please be patient with us as we build Devvit and review your app.

You are required to resubmit your app for Reddit App Review every time you publish changes to it. However, if your updates do not alter your app’s functionality significantly or in a way that might impact its compliance with these Devvit Rules or any other Reddit Terms & Policies, then your updates will go through a streamlined review.

We may require you to provide additional information to us in order to complete our App Review. We also may periodically or randomly re-review your app and require you to make changes or otherwise face a suspension or ban of your app if we find it to no longer be compliant with these Devvit Rules and Reddit Terms & Policies.

If you have questions about Reddit’s App Review and approval process or these Devvit Rules, please reach out for [help](https://developers.reddit.com/docs/help).

## General Rules

### Build for a quality experience

You and your app(s) must:

- Provide discrete functionality and always try to make Reddit more enjoyable
- Maintain functionality that communities rely on, communicate when you cannot, and make it easy to contact you for support
- Be transparent and use clear naming and descriptions that accurately describe your app’s functionality, purpose, and data practices
- Include your own terms of service and privacy policy if your app uses premium features (for example, [payments](https://developers.reddit.com/docs/capabilities/payments), [fetching](https://developers.reddit.com/docs/capabilities/http-fetch), or [using LLMs](#generative-aillm-rules)) or if requested by Reddit
- Provide accurate information about your relationship with Reddit or any other person or entity, including other developers (for example, by including them in your app description)
- Test your app locally and in sandbox subreddits when applicable
- Avoid enabling or allowing others to violate these Devvit Rules or other Reddit Terms & Policies

### Make mod apps easy to use

If your app is intended to be used by mods for moderation purposes, please consider how the app should be configured by mods and provide instructions in your app description. Your instructions should empower mods to know how to use your app safely and responsibly for community governance purposes.

# Safety Rules

### Protect redditors from harm

You and your app(s) must:

- Comply with our [Reddit Rules](https://www.redditinc.com/policies/reddit-rules) and our [Moderator Code of Conduct](https://www.redditinc.com/policies/moderator-code-of-conduct)

- Avoid facilitating, promoting, or amplifying:
- Any form of dangerous activities;
- Harmful or illegal content; or
- Illegal or legally restricted activities

- Ensure proper labeling and warning prior to exposing redditors to graphic, sexually-explicit, or offensive content

- Prevent the manipulation of Reddit's features (e.g., voting, karma) or the circumvention of safety mechanisms (e.g., user blocking, account bans)

- Avoid deceptive content (e.g., spam, malware) or adverse actions that may interfere with the normal use of Reddit (e.g., introducing malicious code or programs that violate these Devvit Rules or other Reddit Terms & Policies)

- Build and implement adequate safeguards to prevent illegal or harmful content or functionality that may violate our [Reddit Rules](https://www.redditinc.com/policies/reddit-rules)

- Provide app users with a way to report issues with the app or violations of these Devvit Rules and review and appropriately action user reports

You and your app(s) must not:

- Attempt to publish an app targeting anyone under 13 — redditors must be over the age of 13 to use the platform!

- Display mature content to redditors without appropriate labels or age-gating functionality

- Include, encourage, or promote illegal or harmful content or functionality, including violence, harassment, bullying, hate speech, threats, or self-harm

- Include or promote deceptive content, functionality, actions, or terms (for example, any form of spam or malware)

### Don’t build restricted apps

You should not create an app or functionality that promotes or facilitates transactions in a prohibited or regulated industry such as (but not limited to) gambling, healthcare, financial and cryptocurrency products and services, political, alcohol, recreational drugs, or any other restricted category listed in the [Reddit Advertising Policy](https://redditinc.force.com/helpcenter/s/article/Reddit-Advertising-Policy-Restricted-Advertisements).

### Apps may be limited or removed

If your app violates any of these Devvit Rules or any other Reddit Terms & Policies, including by mods or redditors using your app, then we may suspend or remove your app from Devvit or require you to update it or add disclaimers. We may also limit your app (including its reach, access to content, and functionality) when appropriate.

All apps we deem to have potential safety issues will need to provide additional information. We expect you to be able to quickly and effectively handle any concerns raised about safety.

## Privacy and Data Rules

### Handle data with care

Your app must comply with all privacy and data protection requirements outlined in Reddit’s [Developer Terms](https://www.redditinc.com/policies/developer-terms), [Developer Data Protection Addendum](https://www.redditinc.com/policies/developer-dpa), and other Reddit Terms & Policies. We take the privacy of redditors seriously and expect you to do so as well. You must:

- **Respect redditors' data and privacy** – never intrude on redditors’ privacy and autonomy in spaces your app isn't authorized to access or moderate, and never try to re-identify, de-anonymize, unscramble, unencrypt, or reverse hash or reverse engineer data about redditors, Reddit, or Devvit;

- **Get consent from redditors** – get explicit consent and appropriate permissions before processing data, or taking any actions (automated or not), on behalf of redditors (including before making any modification to redditors’ accounts), respect user decisions to opt-out or block or remove your app (as applicable), and only use data necessary for your app's stated functionality;

- **Minimize data used** – build with data minimization in mind and never request that redditors share their login credentials or any other personal information to access or complete any action through your app or otherwise collect passwords, credentials, or other personal information from redditors;

- **Be honest (no scams or spam)** – never collect, solicit, or deceive redditors into providing passwords, credentials, or other personal information to you or your app, and never scam nor spam redditors (for example, by frequently sending unsolicited messages) about your app without permissions;

- **Be transparent** – be up front about your data practices, ensure all consents and permissions are complete, accurate, and clearly labeled, and notify Reddit and your users if your app is compromised (e.g., data breach, unauthorized access);

- **Never profile redditors** – never process data to profile or otherwise infer redditors' personal characteristics, such as racial or ethnic origin, political opinions, religious or philosophical beliefs, union membership, genetics or biometrics, health, sex life, or sexual orientation;

- **Never surveil redditors** – never gather intelligence nor attempt to track redditors or Reddit content for the purpose of surveillance, or to provide that information to governments or other entities conducting surveillance;

- **Never sell data** – never sell, license, share, or otherwise commercialize data about redditors or Reddit (including by mining or scraping data from Reddit or Devvit) to target ads, use data brokers, ad networks, or other related services, train machine learning or artificial intelligence models (including large language models), or otherwise commercialize data;

- **Keep your app secure** – keep your app (including your app data and app user data) secure, and do not enable it to bypass or circumvent Reddit’s or Devvit’s privacy, safety, or security features and enforcement measures (including any taken against your app);

- **Keep it legal** – never transmit data of persons under 13 or data that includes protected health info, financial info, or other sensitive info under law; and

- **Comply with our Public Content Policy** – abide by all restrictions described in our [Public Content Policy](https://support.reddithelp.com/hc/en-us/articles/26410290525844-Public-Content-Policy).

### Be careful using external sites or services

If your app uses [HTTP Fetch](https://developers.reddit.com/docs/capabilities/http-fetch) or otherwise collects personal information about app users, we require you to have a terms of service and privacy policy and include a link to both in your app. Your terms of service and privacy policy must completely and accurately describe how you and your app collects, uses, shares, and stores data and why. (Please note that links to Reddit’s [User Agreement](https://redditinc.com/policies/user-agreement) and/or [Privacy Policy](https://www.reddit.com/policies/privacy-policy) will not be accepted.)

If your app links to any third-party site that may collect redditor personal data, you are solely responsible for verifying the legitimacy and security of the third-party site and should ensure that they are in compliance with all applicable laws. For example, you should ensure that a site collecting personal data provides a privacy policy that clearly discloses what data is collected, how the data is used, and how the data is shared.

You’ll also need permission during App Review to direct redditors outside of Reddit or otherwise collect personal information about them. To request HTTP Fetch functionality for a specific domain, please follow [these instructions](https://developers.reddit.com/docs/capabilities/http-fetch).

## Content Rules

### Keep user and app content safe

Any content used or created by your Devvit app must comply with Reddit Terms & Policies. For example:

- **Using Existing User Content** – your app may copy and display existing Reddit user content and modify it for display, but only in compliance with Reddit’s [Developer Terms](https://www.redditinc.com/policies/developer-terms). User content on Reddit is owned by redditors and not by Reddit, so you must also comply with all requirements or restrictions imposed by the owners of user content. Ask redditors for their permission if you want to use existing user content in ways they might not expect (e.g., by building an in-app pop-up asking for redditor approval).

- **Generating New User Content** – your app may allow new user content to be created by redditors, but all user content must comply with Reddit’s [User Agreement](https://www.redditinc.com/policies/developer-terms), [Reddit Rules](https://www.redditinc.com/policies/reddit-rules), and [Advertising Policy](https://redditinc.force.com/helpcenter/s/article/Reddit-Advertising-Policy-Restricted-Advertisements).

  - _Post or Comment Attribution Rules_ – if your app supports the creation of new posts or comments on Reddit by redditors, then you should create a new post or comment with the content author clearly identified as the author of the submitted content. Until your app is approved by Reddit, new content from your app will be posted from your Devvit app account. If your app is approved, then submitPost will post on behalf of the content author.

  - _In-App Content Rules_ – if your app allows users to create new forms of user content within your app (for example, a form submission that modifies the content of your app), your app should limit the available forms of expression to prevent potential abuse. Appropriate examples of limited expression include emojis, symbols (e.g., stock tickers), and predefined, safe dictionaries. If you want to minimize the risk of abuse, avoid allowing users to create new in-app content through free-form text inputs in your app.

- **Displaying Devvit App Content** – your app may include information, materials, and other content that you provide and make available through your app. Your app content must also comply with these Devvit Rules, Reddit’s [User Agreement](https://www.redditinc.com/policies/developer-terms), [Reddit Rules](https://www.redditinc.com/policies/reddit-rules), and [Advertising Policy](https://redditinc.force.com/helpcenter/s/article/Reddit-Advertising-Policy-Restricted-Advertisements). You may not use external logos or trademarks in your app without express written permission.

If any content created or otherwise displayed through your app violates these Devvit Rules or other Reddit Terms & Policies, then Reddit may remove the content and/or request you remove the content. Failure to do so can result in your app being removed from Devvit.

### Enable and respect user deletions

Whether your app uses existing user content or otherwise allows users to create new user content, you and your app must always honor user deletion requests and respect redditors’ privacy rights. More specifically:

- **Deleting Existing User Content** – you are required to remove any user content that has been deleted from Reddit, including from your Devvit app(s). We provide access to post and comment delete events via triggers to help facilitate this.

- _Post/Comment Deletions_ – On PostDelete and CommentDelete event triggers, you must delete all content related to the post and/or comment (for example, title, body, embedded URLs, etc.) from your app. This includes data that is in the Redis/KVstore and data sent to an external service. Metadata required for contextualizing related content (for example, post or comment ID, createdAt, etc.) may be retained.

- _Account Deletions_ – When a user account is deleted, the related user ID (t2\_\*) must be completely removed from your hosted datastores (e.g., Redis) and any external systems. You must also delete all references to the author-identifying information (including the author ID, name, profile URL, avatar image URL, user flair, etc.) from posts and comments created by that account. You may continue to keep posts and comments created by deleted accounts, provided that the posts and comments have not been explicitly deleted.

- _Setting Up Auto-Deletion_ – To best comply with this policy, we recommend deleting any stored user data within 30 days. For any data you are storing in Redis, you can use the [expire function](https://developers.reddit.com/docs/capabilities/redis#key-expiration) to ensure data gets deleted automatically.

- **Enabling Deletions of New User Content** – if your app allows users to create new user content, you must ensure that users have the ability to remove their own content when desired and comply with all legal requirements related to content removals. It is important to have safety guardrails in place if your app allows users to create new user content so that the content can be reported and removed by app users.

Any retention of content and data that has been deleted, even if disassociated, de-identified or anonymized, is a violation of our terms and policies.

## Reddit Brand and IP Rules

### Don’t use Reddit IP

Do not use any Reddit trademarks (e.g., REDDIT or SNOO) or other [brand assets](https://www.redditinc.com/brand) in your app. Check out our [Brand Guidelines](https://reddit.lingoapp.com/k/oYYL4W) and [Trademark Use Policy](https://www.redditinc.com/policies/trademark-use-policy) to learn more.

Your app should be creative and unique and have an original name and branding. It shouldn’t be similar to or confusingly reference Reddit. Do not suggest any endorsement, partnership, sponsorship, or affiliation with Reddit by using Reddit trademarks or other brand assets. For example, do not name your app “Reddit Community Fundraisers” or use Reddit’s alien mascot Snoo as a game character in your app.

Reddit may, at our discretion, permit you to use Reddit trademarks or other brand assets in your app, but all use must comply with our Brand Guidelines and Trademark Use Policy and must be approved by Reddit in writing before your app is published. This review-and-approval process is in addition to our standard App Review; for example, if you are given permission to use Snoo in your app, any plot or dialogue with Snoo must be submitted to Reddit for review and approval.

Developers who fail to respect Reddit’s intellectual property may lose access to Devvit, as well as face other enforcement actions by Reddit.

### Don’t use third-party IP w/o permission

Do not infringe any third-party intellectual property rights or otherwise use any third-party intellectual property in your app without explicit permission. This means no copycat or clone apps. We want apps built on Reddit’s Developer Platform to be unique and solve real use cases for communities and their users.

Your app must:

- **Be original and innovative** – we know you have great ideas and can’t wait to see how you introduce new features or improve existing ones in a meaningful way.

- **Respect intellectual property** – be fair to others. Don’t copy code, UI, images, or logos from other apps without permission and respect existing trademarks and copyrights.

- **Not cause confusion** – apps that impersonate another app, developer, or service are prohibited. This includes cloning apps or suggesting that an app is another app that already exists.

Apps that violate any of these guidelines are subject to removal from Reddit’s Developer Platform at any time, and we may suspend or ban any developer who violates these Devvit Rules and other Reddit Terms & Policies.

## Payment Rules

### Pilot Devvit Goods

You may be able to monetize your Devvit app by offering certain digital avatars, goods, currencies, items, products, or features through your Devvit app (your “app goods”). In order to unlock and use Devvit Payments, you and your app must abide by Reddit’s [Earn Terms](http://redditinc.com/policies/earn-terms) and [Earn Policy](http://redditinc.com/policies/earn-policy), in addition to these Devvit Rules and other Reddit Terms & Policies. For example, you and your app cannot:

- Enable gambling, including the purchase of cryptocurrencies or other digital assets that can be exchanged for real money,

- Have deceptive pricing terms or limit functionality behind a paywall or in-app purchase, or

- Direct redditors off-platform to provide payment to you (e.g., sending you money directly or offering to buy you a coffee).

We’re currently piloting Devvit Payments with a small number of developers. Check out our [Earn Terms](http://redditinc.com/policies/earn-terms) and [Earn Policy](http://redditinc.com/policies/earn-policy) for more information.

### Link carefully to external financial services

If your app links to any third-party site that facilitates financial transactions, you are solely responsible for verifying the legitimacy and security of the third-party site and should ensure that they are in compliance with all applicable laws. For example, you should ensure that a charitable organization collecting donations is registered as a 501(c)(3) organization (or local equivalent) and provides necessary tax receipts. To the extent that you intend to include links to such third-party sites, you must provide your own terms of service and privacy policy.

## Generative AI/LLM Rules

### Only use approved LLMs

Your Devvit apps can use approved Large Language Models (“LLMs”) via the fetch functionality, provided your app adheres to the following guidelines as well as the Reddit Terms & Policies. Your app:

- Provides significant and unique benefit to Reddit users and communities through Reddit;
- Uses an approved LLM (see approved LLM services below);
- Does not use Reddit data to create, improve, modify, train, fine-tune or allow any third-party access to create, improve, modify, train or fine-tune any Generative AI, LLM, ML, or NLP models using Reddit Data\*;
- Includes terms of services and a privacy policy for handling user data; and
- Adheres to all other rate limits and guidelines as outlined in our [Developer Terms](https://www.redditinc.com/policies/developer-terms).

_If you are interested in using Reddit data for LLM training for research or commercial purposes, please submit a request [here](https://support.reddithelp.com/hc/en-us/requests/new?ticket_form_id=14868593862164)._

Approved LLMs:

- Google Gemini

- OpenAI ChatGPT

For the avoidance of doubt, self-hosted LLMs (e.g. LLama, mistral, hugging face) are not approved for use at this time.

Reddit reserves the right to update these guidelines, including approved LLMs, at any time. It is your responsibility to ensure your app is compliant with the latest guidelines.

## Reporting Rules

### Contact your app users

If you want to contact users of your app, you'll currently need to coordinate with our team. This will change in the future, but please reach out to the Developer Platform team to communicate key updates, bugs, etc.

### See something, say something

If you come across an app that you believe violates these Devvit Rules or other Reddit Terms & Policies, please [reach out](https://developers.reddit.com/docs/help) and report it.
