export enum MsgType {
  Presence,
  Message,
}

export enum UserStatus {
  Joined,
  Ping,
  Left,
}

export type Message = {
  type: MsgType;
  user: UserRecord;
};

export type ChatMessage = Message & {
  type: MsgType.Message;
  message: string;
};

export type PresenceMessage = Message & {
  type: MsgType.Presence;
  status: UserStatus;
};

export type RealtimeMessage = ChatMessage | PresenceMessage;

export type UserRecord = {
  id: string;
  session: string;
  name: string;
};
