import { Devvit } from '@devvit/public-api';
import { CreatePreview } from '../../components/Preview.js';
import { BINGO_TILES_COUNT, theme } from '../../constants.js';
import type { ThemeConfig } from '../../types.js';
import type { BingoSettings } from '../settings/index.js';
import { ApprovedDomainsFormatted, isRedditImage } from '../../utils/utils.js';

export const BingoForm = Devvit.createForm(
  {
    title: 'Create bingo board',
    acceptLabel: 'Create Board',
    fields: [
      {
        name: 'title',
        label: 'Post Title',
        type: 'string',
        required: true,
        helpText: `What do you want your post title to be?`,
      },
      {
        name: 'answers',
        label: `Bingo answers (at least ${BINGO_TILES_COUNT} options, use a comma to separate)`,
        type: 'string',
        required: true,
      },
      {
        name: 'theme_appBgImg',
        label: 'Custom background image url (optional)',
        type: 'string',
        required: false,
        helpText: `Allowed domains: ${ApprovedDomainsFormatted}`,
      },
    ],
  },
  async (event, { reddit, subredditId, ui, redis, settings }) => {
    const answersRaw: string = event.values.answers;
    const answers: string[] = answersRaw
      .split(',')
      .map((answer) => answer.trim())
      .filter((answer) => Boolean(answer));

    if (answers.length < BINGO_TILES_COUNT) {
      ui.showToast(`Please enter at least ${BINGO_TILES_COUNT} answers`);
      return;
    }

    const isValidBgImage = isRedditImage(event.values.theme_appBgImg);
    if (!isValidBgImage) {
      ui.showToast(`Please use images from ${ApprovedDomainsFormatted}.`);
      return;
    }

    const settingsValues = (await settings.getAll()) as BingoSettings;

    const postTheme: ThemeConfig = {
      appBgImg: event.values.theme_appBgImg || settingsValues.theme_appBgImg || '',
      logoImg: settingsValues.theme_logoImg || theme.standard.logoImg,
      logoImgWidth: settingsValues.theme_logoImgWidth || theme.standard.logoImgWidth,
      appBackgroundColor:
        settingsValues.theme_appBackgroundColor || theme.standard.appBackgroundColor,
      tileBg: settingsValues.theme_tileBg || theme.standard.tileBg,
      tileBgActive: settingsValues.theme_tileBgActive || theme.standard.tileBgActive,
      tileBorder: settingsValues.theme_tileBorder || theme.standard.tileBorder,
      tileBorderActive: settingsValues.theme_tileBorderActive || theme.standard.tileBorderActive,
      tileText: settingsValues.theme_tileText || theme.standard.tileText,
      tileTextActive: settingsValues.theme_tileTextActive || theme.standard.tileTextActive,
    };

    const title: string = event.values.title;
    const subredditName = (await reddit.getSubredditById(subredditId))?.name;

    const post = await reddit.submitPost({
      title: `${title}`,
      subredditName,
      preview: CreatePreview(),
    });

    //store postID and answers in redis
    await redis.set(post.id, JSON.stringify(answers));
    await redis.set(`${post.id}_theme`, JSON.stringify(postTheme));

    ui.showToast(`Bingo board created!`);
    ui.navigateTo(post);
  }
);
