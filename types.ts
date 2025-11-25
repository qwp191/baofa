export interface ImageFile {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export enum AppStep {
  UPLOAD_FILES = 0,
  GENERATING_SWAP = 1,
  REVIEW_SWAP = 2,
  CONFIGURE_SCENE = 3,
  GENERATING_SCENE = 4,
  FINAL_RESULT = 5,
}

export interface GenerationConfig {
  scene: string;
  outfit: string;
}