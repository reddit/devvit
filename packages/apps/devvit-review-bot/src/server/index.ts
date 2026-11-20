#!/usr/bin/env -S node --experimental-strip-types --no-warnings=ExperimentalWarning
import { createServer, getServerPort } from '@devvit/web/server';

import { onReq } from './server.ts';

const server = createServer(onReq);
server.on('error', (err) => console.error('server error', err));
server.listen(getServerPort());
