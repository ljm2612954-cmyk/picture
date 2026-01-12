
export interface ImageState {
  original: string | null;
  transformed: string | null;
  isProcessing: boolean;
  error: string | null;
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  UNSPECIFIED = 'UNSPECIFIED'
}

export interface TransformOptions {
  gender: Gender;
  suitColor: string;
  backgroundType: string;
}
