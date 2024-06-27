import type { PlaytestSubscriberMessage } from '@devvit/protos/types/devvit/cli/playtest.js';
import { PlaytestProviderMessage } from '@devvit/protos/types/devvit/cli/playtest.js';
import type { ErrorEvent, MessageEvent, VerifyClientCallbackSync, WebSocket } from 'ws';
import { WebSocketServer } from 'ws';
import type { AppLogConfig } from '../util/app-logs/app-log-util.js';
import { formatAppLogDivider, formatAppLogMessage } from '../util/app-logs/app-log-util.js';

const port = 5678;
const livenessInterval = 15_000;

/**
 * Playtest development mode server. Connects PlaytestClients for bidirectional
 * messaging. See PlaytestClient.
 */
export class PlaytestServer {
  /** Connection by Connection.id. */
  #connections: readonly Connection[] = [];
  readonly #logConfig: Readonly<AppLogConfig>;
  readonly #logger: Logger;
  #server?: WebSocketServer | undefined;
  #timer?: ReturnType<typeof setInterval> | undefined;

  constructor(logConfig: Readonly<AppLogConfig>, logger: Logger) {
    this.#logConfig = logConfig;
    this.#logger = logger;
  }

  close(): void {
    if (this.#timer != null) clearInterval(this.#timer);
    this.#timer = undefined;
    for (const con of this.#connections) con.sock.terminate();
    this.#connections = [];
    this.#server?.close();
    this.#server = undefined;
  }

  open(): void {
    if (this.#server) return;
    this.#timer = setInterval(this.#checkLiveness, livenessInterval);
    this.#server = new WebSocketServer({ port, verifyClient: this.#onVerifyClient });
    this.#server.on('connection', this.#onSockOpened);
    this.#server.on('error', this.#onServerErr);
  }

  /** Send to all connections. */
  send(msg: PlaytestSubscriberMessage): void {
    for (const con of this.#connections) con.sock.send(JSON.stringify(msg));
  }

  #checkLiveness = (): void => {
    const now = Date.now();
    for (const con of this.#connections) {
      if (now - con.active > 2 * livenessInterval) {
        // The socket cannot be closed gracefully. Terminate the socket to
        // trigger close.
        con.sock.terminate();
        continue;
      }
      con.sock.ping(); // There's no web API for ping data.
    }
  };

  #onServerErr = (ev: ErrorEvent): void => {
    this.#logger.warn(`connection server error ${ev.error}: ${ev.message}`);
  };

  #onSockClosed(con: Readonly<Connection>): void {
    if (con.url) this.#logger.log(formatAppLogDivider(`${con.url} disconnected`, 'TruncStart'));
    this.#connections = this.#connections.filter((connection) => connection !== con);
  }

  #onSockErr = (ev: ErrorEvent): void => {
    this.#logger.warn(`socket error ${ev.error}: ${ev.message}`);
  };

  #onSockMsg(con: Connection, ev: MessageEvent): void {
    if (typeof ev.data !== 'string') {
      this.#logger.warn(`omitting unsupported ${typeof ev.data} message`);
      return;
    }
    let json;
    try {
      json = JSON.parse(ev.data);
    } catch {
      this.#logger.warn(`omitting unparseable message "${ev.data}"`);
      return;
    }
    const msg = PlaytestProviderMessage.fromJSON(json);
    if (msg.callState)
      for (const log of msg.callState.logs)
        this.#logger.log(formatAppLogMessage(log, this.#logConfig, true));
    if (msg.connect) {
      // Technically, the connection happens in #onSockOpened() but presenting
      // the tab URL as the entity is more sensible to users.
      con.url = msg.connect.url;
      this.#logger.log(formatAppLogDivider(`${con.url} connected`, 'TruncStart'));
    }
  }

  #onSockOpened = (sock: WebSocket): void => {
    const con = { active: Date.now(), sock };
    this.#connections = [...this.#connections, con];
    sock.onclose = () => this.#onSockClosed(con);
    sock.onmessage = (ev) => this.#onSockMsg(con, ev);
    sock.onerror = this.#onSockErr;
    sock.on('pong', () => {
      con.active = Date.now();
    });
  };

  /**
   * Verify the origin of the document opening the websocket connection. The
   * recommended approach is convoluted. See
   * https://github.com/websockets/ws/issues/377#issuecomment-462152231.
   */
  #onVerifyClient: VerifyClientCallbackSync = (info) => {
    // Get just the domain portion of the Origin header, ignoring protocol and
    // port.
    const domain = new URL(info.origin).hostname;

    const allowed = ['localhost', '127.0.0.1', '0.0.0.0', '[::1]', 'reddit.com', 'snoo.dev'].some(
      (allowed) => allowed === domain || domain.endsWith(`.${allowed}`)
    );
    if (!allowed) this.#logger.warn(`ignoring unknown connection from ${info.origin}`);
    return allowed;
  };
}

type Connection = {
  readonly sock: WebSocket;
  /** See PlaytestConnect.url. */
  url?: string;
  /** Timestamp client last communicated. */
  active: number;
};

type Logger = {
  log(...args: readonly unknown[]): void;
  warn(...args: readonly unknown[]): void;
};
