export enum PageType {
  VOTE,
  RESULTS,
  CONFIRM,
}

export interface PollProps {
  navigate: (page: PageType) => void;
  remainingMillis: number;
  options: string[];
  optionsPerPollPage: number;
  pollPages: number;
  votes: number[];
  description: string | undefined;
  setVotes: (votes: number[]) => void;
  setFinish: (timestamp: number) => void;
  finish: number;
  total: number;
  allowShowResults: boolean;
  randomizeOrder: boolean;
  reset: () => Promise<void>;
}
