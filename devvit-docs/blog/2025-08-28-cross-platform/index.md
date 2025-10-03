---
slug: mobile-first-development
tags: [mobile, game, devvit, cross-platform]
---

# When Building Cross-Platform Developer Apps - Think Mobile-First

As part of our efforts to spotlight developer insights, we interviewed a Staff Engineer on the Developer Platform team, [Marcus Wood](https://www.linkedin.com/in/mwood23), about building cross-platform apps on Reddit’s Developer Platform. Marcus has been integral in developing games (like our April Fools day experience, [r/Field](https://www.reddit.com/r/Field/)) and tools for iOS, Android, and web.

Below are the key takeaways from our interview, where he shared his perspective on designing for Reddit’s unique environment—one that rewards mobile-first design and thrives on user-generated content.

Devvit apps work across Reddit platforms to ensure all users can enjoy developer creations, no matter how or where they access our communities. However, this can often pose issues for developers trying to deliver a performant and consistent experience.

# Why Mobile-First is Important

A majority of Reddit’s logged-in user base accesses the platform via mobile. For developers building cross-platform experiences, this should be an indicator and a north star for designing. Developers should prioritize touch-first UX, optimize for mobile performance, and design interactive elements — especially around “thumb zones” for games.

Marcus also offered a few go-to mobile UX tips that have seen success across the platform:

- Larger tap targets (44x44px) in games/experiences
- Placing key buttons near the bottom of the screen (thumb-friendly)
- Use in-game overlays and tutorials to educate users ([Ducky Dash](https://www.reddit.com/r/RedditGames/) is a great example)

# Integrate with Reddit, but Don’t Spam

Reddit is a _surprised Pikachu meme_ opinionated ecosystem of communities and users. So Marcus cautioned against spammy tactics like flooding comment threads with things like auto-progress updates with games. Instead, he recommended meeting users “where they are”—for example, prompting subreddit subscriptions within the game or encouraging comments only after an “aha” moment like completing a game level.

# Build with UGC in Mind

User-generated content is a game changer for your game being discovered on Reddit. For instance, [Flappy Goose](https://www.reddit.com/r/RedditGames/)’s level builder and [Karma Crunch](https://www.reddit.com/r/KarmaCrunch/)’s avatar customizer are prime examples of apps that encouraged community creativity. “Apps that lead to more posts are the ones that win.”

Reddit’s feeds generally reward fresh and engaging content, regardless of platform, and your app can help generate that.
Additionally, Reddit’s biggest advantage is community. It's full of creative, engaged users who will run with whatever building blocks you give them.

“Build tools, not just toys,” Marcus advised. “The most magical moments happen when users do the unexpected.”

# Testing and Performance

Performance on Reddit isn't about smooth animations—it's about efficiency at scale. Apps like our April Fool's r/[Field](https://www.reddit.com/r/Field/) optimized bandwidth through bit-packing rather than device rendering. Knowing that he recommends:

- Batching requests to reduce load
- Using Redis for real-time features over constant polling
- Minimizing unnecessary network chatter

Make sure you’re doing your best to monitor and test performance across as many devices as possible. If you don’t have access to testing your app on some platforms, we recommend requesting platform-specific feedback as part of [Feedback Friday](https://www.reddit.com/r/Devvit/comments/1lwfsuo/introducing_feedback_friday_on_rdevvit/).

Some important things to be mindful of when testing:

- Platform and device light mode/dark mode settings
- Responsiveness on mobile devices
- Text and component sizes based on device and accessibility settings
- Also (shameless plug) to use our new [UI simulator](https://developers.reddit.com/docs/ui_simulator)

# Final Advice for Aspiring Reddit Game Devs

For developers looking to get started:

- Build apps with the mobile experience in mind
- Focus on apps that drive new content (user generated content is a great way to achieve this)
- Use popular frameworks
- Avoid overly complex or unorthodox implementations
- Join the [r/devvit](https://www.reddit.com/r/Devvit/) community and share feedback
