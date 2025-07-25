# Building community games

Reddit offers a unique platform for a new category of social games. This guide will help you create engaging community games that thrive in Reddit's ecosystem with lessons from some of the games we've seen so far.

## What are community games?

Community games are asynchronous multiplayer experiences built specifically for Reddit's platform. They leverage Reddit's unique social dynamics and content mechanics to create engaging, bite-sized gaming experiences that scale from single players to thousands.

## Why build a community game?

- _Played by millions_ - Successful apps will be distributed to millions of users in their home feed
- _Hosted services_ - We provide hosting, storage (redis), and robust backend capabilities (realtime, scheduler, trigger) with every app
- _Build once, play everywhere_ - if you build your apps once they will run on web, android, and iOS
- _Monetization opportunities_ - We have reddit developer funds and payments to reward successful apps with a handful of new monetization opportunities coming soon.

## Core design principles

### 1. Keep it bite-sized

- Focus on quick, discrete gameplay loops
- Reduce "time to fun" - players should be having fun within seconds
- Small scope = faster development and easier maintenance
- Example: [r/ChessQuiz](https://reddit.com/r/chessquiz) offers daily chess puzzles rather than full matches

### 2. Design for the feed

- Create an eye-catching first screen that stands out
- Include a clear, immediate call to action
- Remember: You're competing with cat videos and memes
- Example: [r/Pixelary](https://reddit.com/r/pixelary]) shows the drawing canvas right in the feed

### 3. Build content flywheels

Reddit posts naturally decay after a few days. Your game needs a strategy to stay relevant:

**Option A: Scheduled content**

- Daily/weekly challenges
- Automated post creation
- Regular tournaments or events
- Example: [r/Sections](https://reddit.com/r/sections) posts a new puzzle every day

**Option B: Player-generated content**

- Players create content through gameplay
- Each play creates new posts/comments
- Moderation systems for quality control
- Example: [r/CaptionContest](https://reddit.com/r/captioncontest) turns each submission into new content

### 4. Embrace asynchronous play

Benefits:

- Players can participate anytime
- Lower commitment (one move vs. entire game)
- Larger player pool across time zones
- Better scalability

### 5. Scale from one to many

Your game should be fun at any player count:

- Single-player baseline experience
- Scales smoothly as more players join
- Uses leaderboards to create competition
- Example: [r/DarkDungeonGame](https://reddit.com/r/darkdungeongame) works solo but gets better with more players solving together

## Successful examples

### Pixelary (drawing and guessing game)

- **Primary loop**: Draw (hard) → Creates posts
- **Secondary loop**: Guess (easy) → Creates comments (optionally)
- **Why it works**:
  - Clear mental model
  - Two-tiered engagement
  - Natural content generation
  - Scales with community size

### ChezzQuiz (competitive chess puzzles)

- **Core loop**: Daily puzzles with competitive solving
- **Why it works**:
  - Consistent content schedule
  - Built-in competition
  - Leverages existing chess knowledge
  - Clear success metrics

## Best practices checklist

- ✅ Create your own subreddit
- ✅ Can be played in under 2 minutes
- ✅ Has a striking first impression
- ✅ Creates new content regularly
- ✅ Works for both 1 and 1000 players
- ✅ Has clear user actions
- ✅ Includes social elements
- ✅ Uses moderation tools

## Common pitfalls to avoid

- ❌ Complex game rules
- ❌ Long time commitments
- ❌ Requiring specific player counts
- ❌ Dependency on real-time interactions
- ❌ Unclear first actions
- ❌ No content refresh strategy

## Key takeaway

The most successful Reddit community games create interesting content while being played, establishing a virtuous cycle of engagement and discovery. Focus on simplicity, scalability, and social interaction to make your game thrive.
