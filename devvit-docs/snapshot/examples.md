# Examples

## Accounts

### CSV

```
id,name,url,snoovatar_image,account_karma,suspended,banned,spam
t2_tcl14rp6,JSPdaGhoSt928,https://www.reddit.com/user/JSPdaGhoSt928,https://i.redd.it/snoovatar/avatars/a5307b33-359c-4b2e-a26e-1557e098d8ec.png,0,false,false,false
```

### JSON

```
{
  "id": "t2_tcl14rp6",
  "name": "JSPdaGhoSt928",
  "url": "https://www.reddit.com/user/JSPdaGhoSt928",
  "snoovatar_image": "https://i.redd.it/snoovatar/avatars/a5307b33-359c-4b2e-a26e-1557e098d8ec.png",
  "account_karma": "0",
  "suspended": false,
  "banned": false,
  "spam": false
}
```

## Subreddits

### CSV

```
id,name,permalink,nsfw,spam,subscribers_count,type
t5_2qh33,funny,/r/funny,false,false,66646236,public
```

### JSON

```
{
  "id": "t5_2qh33",
  "name": "funny",
  "permalink": "/r/funny",
  "nsfw": false,
  "spam": false,
  "subscribers_count": "66646236",
  "type": "public"
}
```

## Posts

### CSV

```
id,subreddit_id,title,body,url,content_redaction_reason,author_id,author_redaction_reason,nsfw,score,upvote_ratio,approved,distinguished,self,video,locked,spoiler,sticky,flair_text,deleted,spam,language_code,gildings,thumbnail,crosspost_parent_id,permalink,num_comments,created_at,updated_at,num_views,num_shares,gallery_images
t3_1eerdy6,t5_2qrrq,What is Utah’s nhl team name,"What is utahs hockey name going to be? I looked online and couldn't find a straight answer. ",/r/nhl/comments/1eerdy6/what_is_utahs_nhl_team_name/,,t2_1439bnpb8s,,false,-47,0.20253164556962025,false,,true,false,false,false,false,,false,true,en,0,,,r/nhl/comments/1eerdy6,54,2022-12-18 00:59:17.222,2023-05-28 17:16:30.757003,7230,42,""
```

### JSON

```
{
  "id": "t3_1eerdy6",
  "subreddit_id": "t5_2qrrq",
  "title": "What is Utah’s nhl team name",
  "body": "What is utahs hockey name going to be? I looked online and couldn't find a straight answer. ",
  "url": "/r/nhl/comments/1eerdy6/what_is_utahs_nhl_team_name/",
  "author_id": "t2_1439bnpb8s",
  "nsfw": false,
  "score": "-47",
  "upvote_ratio": 0.20253164556962025,
  "approved": false,
  "self": true,
  "video": false,
  "locked": false,
  "spoiler": false,
  "sticky": false,
  "deleted": false,
  "spam": true,
  "language_code": "en",
  "gildings": "0",
  "permalink": "r/nhl/comments/1eerdy6",
  "num_comments": "54",
  "created_at": "2022-12-18 00:59:17.222",
  "updated_at": "2023-05-28 17:16:30.757003",
  "num_views": "7230",
  "num_shares": "42",
  "gallery_images": []
}
```

## Posts with gallery image lists

### CSV

```
id,subreddit_id,title,body,url,content_redaction_reason,author_id,author_redaction_reason,nsfw,score,upvote_ratio,approved,distinguished,self,video,locked,spoiler,sticky,flair_text,deleted,spam,language_code,gildings,thumbnail,crosspost_parent_id,permalink,num_comments,created_at,updated_at,num_views,num_shares,gallery_images
t3_11hzelu,t5_2sltt,Psychedelic,,https://www.reddit.com/gallery/11hzelu,,t2_5sezlgzg,,false,-20,0.083333333333333329,,,false,false,false,false,false,,false,true,en,0,https://b.thumbs.redditmedia.com/1ibEP4xF0o5aJzD-bu7ZztYdQWu0zgv8wyS5biEzXmE.jpg,,r/psychedelicrock/comments/11hzelu,2,2023-03-04 13:41:46.781,2023-03-06 17:40:41.184651,58,,"https://i.redd.it/l7maautf7qla1.png,https://i.redd.it/q47xiwtf7qla1.png"
```

### JSON

```
{
  "id": "t3_11hzelu",
  "subreddit_id": "t5_2sltt",
  "title": "Psychedelic",
  "url": "https://www.reddit.com/gallery/11hzelu",
  "author_id": "t2_5sezlgzg",
  "nsfw": false,
  "score": "-20",
  "upvote_ratio": 0.083333333333333329,
  "self": false,
  "video": false,
  "locked": false,
  "spoiler": false,
  "sticky": false,
  "deleted": false,
  "spam": true,
  "language_code": "en",
  "gildings": "0",
  "thumbnail": "https://b.thumbs.redditmedia.com/1ibEP4xF0o5aJzD-bu7ZztYdQWu0zgv8wyS5biEzXmE.jpg",
  "permalink": "r/psychedelicrock/comments/11hzelu",
  "num_comments": "2",
  "created_at": "2023-03-04 13:41:46.781",
  "updated_at": "2023-03-06 17:40:41.184651",
  "num_views": "58",
  "gallery_images": [
    "https://i.redd.it/l7maautf7qla1.png",
    "https://i.redd.it/q47xiwtf7qla1.png"
  ]
}
```

## Posts with Redactions

### CSV

```
id,subreddit_id,title,body,url,content_redaction_reason,author_id,author_redaction_reason,nsfw,score,upvote_ratio,approved,distinguished,self,video,locked,spoiler,sticky,flair_text,deleted,spam,language_code,gildings,thumbnail,crosspost_parent_id,permalink,num_comments,created_at,updated_at,num_views,num_shares,gallery_images
t3_1fnhzbh,t5_3nbzd,,,,user_deleted,t2_qhh7k2i1,,false,-43,0.022222222222222223,,,true,false,false,false,false,Question,true,false,en,0,,,r/MagicArena/comments/1fnhzbh,10,2024-09-23 11:19:59.942,2024-09-23 13:32:53.809515,452,2,""
```

### JSON

```
{
    "id": "t3_1fnhzbh",
    "subreddit_id": "t5_3nbzd",
    "content_redaction_reason": "user_deleted",
    "author_id": "t2_qhh7k2i1"
    "nsfw": false,
    "score": "-43",
    "upvote_ratio": 0.022222222222222223,
    "self": true,
    "video": false,
    "locked": false,
    "spoiler": false,
    "sticky": false,
    "flair_text": "Question",
    "deleted": true,
    "spam": false,
    "language_code": "en",
    "gildings": "0",
    "permalink": "r/MagicArena/comments/1fnhzbh",
    "num_comments": "10",
    "created_at": "2024-09-23 11:19:59.942",
    "updated_at": "2024-09-23 13:32:53.809515",
    "num_views": "452",
    "num_shares": "2",
    "gallery_images": []
  }
```

## Comments

### CSV

```
id,post_id,parent_id,created_at,last_modified_at,body,content_redaction_reason,author_id,author_redaction_reason,gilded,score,upvote_ratio,deleted,collapsed_in_crowd_control,spam,subreddit_id,permalink
t1_m5oolr7,t3_1hureei,t1_m5oofol,2025-01-06T12:04:18.954,2025-01-13T22:30:50.232786,"My friend is a judge for espresso and roasting competitions. He has seen the best of the best of what money can buy. \n\nHe recommends to me and my friend circle (with unlimited budget) the Rocket grinder and rocket espresso machine.",,,t2_8fafi9z,,false,-7,0.26666666666666666,false,false,false,t5_2rqoi,/r/espresso/comments/1hureei/comment/m5oolr7
```

### JSON

```
{
  "id": "t1_m5oolr7",
  "post_id": "t3_1hureei",
  "parent_id": "t1_m5oofol",
  "created_at": "2025-01-06T12:04:18.954",
  "last_modified_at": "2025-01-13T22:30:50.232786",
  "body": "My friend is a judge for espresso and roasting competitions. He has seen the best of the best of what money can buy. \n\nHe recommends to me and my friend circle (with unlimited budget) the Rocket grinder and rocket espresso machine.",
  "author_id": "t2_8fafi9z",
  "gilded": false,
  "score": "-7",
  "upvote_ratio": 0.26666666666666666,
  "deleted": false,
  "collapsed_in_crowd_control": false,
  "spam": false,
  "subreddit_id": "t5_2rqoi",
  "permalink": "/r/espresso/comments/1hureei/comment/m5oolr7"
}
```

## Comments with Redactions

### CSV

```
id,post_id,parent_id,created_at,last_modified_at,body,content_redaction_reason,author_id,author_redaction_reason,gilded,score,upvote_ratio,deleted,collapsed_in_crowd_control,spam,subreddit_id,permalink
t1_gngp1na,t3_ljvhmv,t1_gngoscj,2021-02-14 20:39:27.109,2021-02-19 20:32:18.304844,,user_deleted,t2_7byxo,,false,0,0.5,true,false,false,t5_2tk0s,/r/unpopularopinion/comments/ljvhmv/comment/gngp1na
```

### JSON

```
{
  "id": "t1_gngp1na",
  "post_id": "t3_ljvhmv",
  "parent_id": "t1_gngoscj",
  "created_at": "2021-02-14 20:39:27.109",
  "last_modified_at": "2021-02-19 20:32:18.304844",
  "redaction_reason": "user_deleted",
  "author_id": "t2_7byxo",
  "gilded": false,
  "score": "0",
  "upvote_ratio": 0.5,
  "deleted": true,
  "collapsed_in_crowd_control": false,
  "spam": false,
  "subreddit_id": "t5_2tk0s",
  "permalink": "/r/unpopularopinion/comments/ljvhmv/comment/gngp1na"
}
```

## Records to Remove

### CSV

```
id,entity_type
t5_79ccc4,subreddit
```

### JSON

```
{
  "id": "t5_79ccc4",
  "entity_type": "subreddit"
}
```

## Records to Redact

### CSV

```
id,entity_type
t3_1byr5wl,post
```

### JSON

```
{
  "id": "t3_1byr5wl",
  "entity_type": "post"
}
```
