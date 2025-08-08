
export enum GameMode {
  CharToPinyin = '看字選音',
  PinyinToChar = '看音選字',
}

export interface GameQuestion {
  question: string;
  options: string[];
  answer: string;
  hint: string;
}

export enum GameState {
  Loading,
  Playing,
  Finished,
  Error,
}
