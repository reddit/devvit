import { TwirpError } from 'twirp-ts';

export const handleTwirpError = (error: unknown, logger: (message: string) => never): never => {
  if (error instanceof TwirpError) {
    return logger(error.msg);
  }
  // we only care about TwirpError, no custom handling for other kinds of errors
  throw error;
};
