# Build a blocks post

1. Login to Devvit.
2. Start a new project.

```tsx
devvit new <my-project>
```

3. Select the `blocks-post` template. (if you're familar with webviews, you can use `webview-post`)
4. Navigate to your project directory.

```tsx
cd <my-project>
```

5. If you want to add some additional flair to the template code, edit the `src/main.ts` file and save your changes.

6. Upload your project.

```tsx
devvit upload
```

7. Use playtest to check out your interactive post on a test subreddit that you moderate.

```tsx
devvit playtest <your-test-subreddit-name>
```

8. Go to your test subreddit to see your interactive post (you might need to hit refresh).

![experience_post](./assets/experience-post-example.png)

When you're done iterating, you can [publish](dev_guide.mdx#9publish) your app and then make it [public](dev_guide.mdx#10gopublic).
