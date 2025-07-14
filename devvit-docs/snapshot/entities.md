# Entities

## Accounts

An account represents a user identity on Reddit. One user can have multiple accounts, but that relationship is not captured. Accounts can also be referenced as users, redditors, or authors of a post or comment.

## Subreddits

A [subreddit](https://support.reddithelp.com/hc/en-us/articles/204533569-What-are-communities-or-subreddits) is a community within Reddit that is dedicated to a specific topic. Each subreddit provides a forum where users can post content (like test, images, videos, or links) and other users can comment and vote on it. There are also user subreddits, which are personal profile pages where the user posts content directly to their profile and lets other users interact with those posts.

Note that a subreddit may be excluded from the data snapshot because of legal or policy reasons.

## Posts

A post is a single piece of content on a subreddit. Posts are generally one of two types:

- An **external link** is a post that contains a link to an article, blog, or another external online resource.
- A **self post** is one where content is provided by an author in the form of text and/or other media. A self post may contain multiple images that are referred to as a gallery.

In general, other users can comment or vote on a given post unless it is locked by a moderator or administrator. Note that a post may be excluded from the data due to legal or policy reasons.

A post may be included in Snapshot but marked as “redacted” with its author, title, contents, URL, and/or associated media removed if:

- The account of the post author is deleted. In this case, the author_id is redacted.
- The post is removed by the author, moderator, or Reddit. In this case, the title, content, and URL of the post is redacted.

### Video posts

You can access the video file in posts (where `video = true` in the [schema](schemas.md#posts)). The URL field contains the link to the page with the DASH player. For example: `https://v.redd.it/pzl1p17yyefc1`

The files can be downloaded directly or extracted from the DASH playlist on the HTML page at the URL. You can also construct a DASH playlist link using the following format:

> `https://v.redd.it/<media_id>/DASHPlaylist.mpd`
>
> For example: `https://v.redd.it/pzl1p17yyefc1/DASHPlaylist.mpd`

The DASH playlist includes separate container files for video and audio with multiple video quality options.

### Image posts and gallery posts

A post may consist of one image or multiple images.

- For a single image post, the URL will include an image file extension (for example: .jpeg, .png).
- Images that are hosted on Reddit will have a URL prefix `https://i.redd.it/`
- For a gallery image post (multiple images presented in a carousel format on Reddit), the URL will be a link to the image gallery. Individual image addresses for gallery posts are provided in the `gallery_images` field of the post (see [schema](schemas.md#posts)).

## Comments

A comment is a response to a post or another comment on a post. A comment may be excluded from the data due to legal or policy reasons.

A comment may be included in Snapshot but marked as “redacted” and its author and/or contents removed if:

- The account of the comment author is deleted. In this case, the author_id is redacted.
- The comment is removed by the author, moderator, or Reddit. In this case, the body of the comment is redacted.
