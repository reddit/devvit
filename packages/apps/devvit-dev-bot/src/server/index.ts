import { createServer, getServerPort, reddit } from '@devvit/web/server';
import type { OnModMailRequest, TriggerResponse } from '@devvit/web/shared';
import express from 'express';

import { HttpReq, HttpRsp } from './types';

const app = express();

// Middleware for JSON body parsing
app.use(express.json());
// Middleware for URL-encoded body parsing
app.use(express.urlencoded({ extended: true }));
// Middleware for plain text body parsing
app.use(express.text());

const router = express.Router();

router.post(
  '/internal/on-mod-mail',
  async (
    req: HttpReq<unknown, unknown, OnModMailRequest>,
    res: HttpRsp<TriggerResponse>
  ): Promise<void> => {
    if (!req) {
      res.status(400).json({
        status: 'error',
        message: 'request is undefined',
      });
      return;
    }

    console.log('\n====\nReceived modmail trigger event:');
    const userName = req.body.messageAuthor?.name;
    const subredditName = req.body.conversationSubreddit?.name;
    if (!userName || !subredditName) {
      res.status(400).json({
        status: 'error',
        message: 'userName or subredditName is missing',
      });
      return;
    }
    const authorType = req.body.messageAuthorType;
    const user = await reddit.getUserByUsername(userName);

    console.log({ authorType, userName, isAdmin: user?.isAdmin });

    if (!user?.isAdmin) {
      console.log(`[Declined] Non-admin account ${userName}.`);
      res.status(200).json({ status: 'ok' });
      return;
    }

    await reddit.approveUser(userName, subredditName);
    console.log(`[Approved] Admin account ${userName}.`);
    res.status(201).json({ status: 'ok' });
  }
);

app.use(router);

const server = createServer(app);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(getServerPort());
