export type HttpOverride = {
  __type: 'HTTP';
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'PATCH';
  handler: Function;
};
