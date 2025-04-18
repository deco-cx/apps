export type ViduModel = "vidu2.0" | "vidu1.5" | "vidu1.0";
export type ViduResolution = "360p" | "720p" | "1080p";
export type ViduMovementAmplitude = "auto" | "small" | "medium" | "large";
export type ViduAspectRatio = "16:9" | "9:16" | "1:1";
export type StartEndToVideoModel = "vidu2.0" | "vidu1.5";

export interface ImageToVideoRequestBody {
  /**
   * @title Presigned URL
   * @description The presigned URL used to upload the video after it is generated. If you dont have any, ask for the user to provide one, and hint to search in his tools. This is used only to upload the video after it is generated, and not as a preview.
   */
  presignedUrl: string;
  /** @title Model name */
  /** @default "vidu2.0" */
  /** @description The model to use for video generation. */
  model?: ViduModel;
  /**
   * @title Public URLs of images
   * @description Provide a public URL for each image. You must use one of the following codecs: PNG, JPEG, JPG, WebP. The dimensions of the images must be at least 128x128 pixels. The aspect ratio of the images must be less than 1:4 or 4:1. All images are limited to 50MB.
   */
  images: string[];
  /**
   * @title Text prompt
   * @description A textual description for video generation, with a maximum length of 1500 characters.
   */
  prompt?: string;
  /**
   * @title Duration (seconds)
   * @description The number of seconds of duration for the output video. vidu2.0 only accepts 4 seconds.
   * @default 4
   */
  duration?: 4 | 8;
  /**
   * @title Random seed
   * @description Manually set values will override the default random seed.
   */
  seed?: number;
  /**
   * @title Resolution
   * @description The resolution of the output video. Defaults to 360p , accepted value: 360p 720p 1080p
   * Model vidu1.0 only accepted 360p
   * Model vidu1.5 duration 4 accepted: 360p 720p 1080p
   * Model vidu1.5 duration 8 accepted: 720p
   * Model vidu2.0 duration 4 accepted: 360p 720p
   * @default "360p"
   */
  resolution?: ViduResolution;
  /**
   * @title Movement Amplitude
   * @description The movement amplitude of objects in the frame. Available for model vidu1.5 and model vidu2.0.
   * @default "auto"
   */
  movement_amplitude?: ViduMovementAmplitude;
  /**
   * @title Aspect Ratio
   * @description The aspect ratio of the output video. Model vidu1.0 only accepts 16:9. Models vidu1.5 and vidu2.0 accept 16:9, 9:16, 1:1.
   * @default "16:9"
   */
  aspect_ratio?: ViduAspectRatio;
}

export interface ImageToVideoResponseBody {
  task_id: string;
  state: "created" | "queueing" | "processing" | "success" | "failed";
  model: ViduModel;
  imagess: [string];
  prompt?: string;
  duration: number;
  seed: number;
  resolution: ViduResolution;
  movement_amplitude?: ViduMovementAmplitude;
  created_at: string; // ISO 8601 format string
}

export interface GenerationResultCreation {
  id: string;
  /** @description The URL of the generated video, valid for one hour. */
  url: string;
  /** @description The cover URL of the generated video, valid for one hour. */
  cover_url: string;
}

export interface GetGenerationResultResponseBody {
  state: "created" | "queueing" | "processing" | "success" | "failed";
  err_code?: string;
  creations?: GenerationResultCreation[];
}

export type TextToVideoModel = "vidu1.5" | "vidu1.0";
export type TextToVideoStyle = "general" | "anime";
export type TextToVideoAspectRatio = "16:9" | "9:16" | "1:1";

export interface TextToVideoRequestBody {
  /**
   * @title Presigned URL
   * @description The presigned URL used to upload the video after it is generated. If you dont have any, ask for the user to provide one, and hint to search in his tools. This is used only to upload the video after it is generated, and not as a preview.
   */
  presignedUrl: string;
  /**
   * @title Model name
   * @description Accepted values: vidu1.5 | vidu1.0 .
   * @default "vidu1.5"
   */
  model?: TextToVideoModel;
  /**
   * @title Style
   * @description The style of output video. Defaults to general.
   * @default "general"
   */
  style?: TextToVideoStyle;
  /**
   * @title Text prompt
   * @description A textual description for video generation, with a maximum length of 1500 characters.
   */
  prompt: string;
  /**
   * @title Duration (seconds)
   * @description The number of seconds of duration for the output video. Can be 4 or 8.
   * @default 4
   */
  duration?: 4 | 8;
  /**
   * @title Random seed
   * @description Manually set values will override the default random seed.
   */
  seed?: number;
  /**
   * @title Aspect Ratio
   * @description The aspect ratio of the output video. Model vidu1.0 only accepts 16:9. Model vidu1.5 accepts 16:9, 9:16, 1:1.
   * @default "16:9"
   */
  aspect_ratio?: TextToVideoAspectRatio;
  /**
   * @title Resolution
   * @description The resolution of the output video. Model vidu1.0 only accepts 360p. Models vidu1.5 duration 4 accepted: 360p 720p 1080p. Model vidu1.5 duration 8 accepted: 720p.
   * @default "360p"
   */
  resolution?: ViduResolution;
  /**
   * @title Movement Amplitude
   * @description The movement amplitude of objects in the frame. Available for model vidu1.5.
   * @default "auto"
   */
  movement_amplitude?: ViduMovementAmplitude;
  /**
   * @title Callback URL
   * @description URL to receive task status updates via POST requests.
   */
  callback_url?: string;
}

export interface TextToVideoResponseBody {
  task_id: string;
  state: "created" | "queueing" | "processing" | "success" | "failed";
  model: TextToVideoModel;
  style?: TextToVideoStyle;
  prompt: string;
  duration: number;
  seed: number;
  aspect_ratio?: TextToVideoAspectRatio;
  resolution: ViduResolution;
  movement_amplitude?: ViduMovementAmplitude;
  created_at: string; // ISO 8601 format string
}

export interface ReferenceToVideoRequestBody {
  /**
   * @title Presigned URL
   * @description The presigned URL used to upload the video after it is generated. If you dont have any, ask for the user to provide one, and hint to search in his tools. This is used only to upload the video after it is generated, and not as a preview.
   */
  presignedUrl: string;
  /**
   * @title Model name
   * @description The model to use for video generation. Accepted values: vidu2.0 | vidu1.5 | vidu1.0
   * @default "vidu2.0"
   */
  model?: ViduModel;
  /**
   * @title Reference Images
   * @description The model will use the provided images as references to generate a video with consistent subjects.
   * Model vidu1.0 only accepts 1 image, while vidu1.5 and vidu2.0 accepts 1 to 3 images.
   */
  images: string[];
  /**
   * @title Text prompt
   * @description A textual description for video generation, with a maximum length of 1500 characters.
   */
  prompt: string;
  /**
   * @title Duration (seconds)
   * @description The number of seconds of duration for the output video.
   * Model vidu2.0 only accepts 4 seconds.
   * @default 4
   */
  duration?: 4 | 8;
  /**
   * @title Random seed
   * @description Manually set values will override the default random seed.
   */
  seed?: number;
  /**
   * @title Aspect Ratio
   * @description The aspect ratio of the output video.
   * Model vidu1.0 only accepts 16:9.
   * Models vidu1.5 and vidu2.0 accept 16:9, 9:16, 1:1.
   * @default "16:9"
   */
  aspect_ratio?: ViduAspectRatio;
  /**
   * @title Resolution
   * @description The resolution of the output video.
   * Model vidu1.0 only accepts 360p.
   * Model vidu1.5 duration 4 accepts: 360p, 720p, 1080p.
   * Model vidu1.5 duration 8 accepts: 720p.
   * Model vidu2.0 duration 4 accepts: 360p, 720p.
   * @default "360p"
   */
  resolution?: ViduResolution;
  /**
   * @title Movement Amplitude
   * @description The movement amplitude of objects in the frame.
   * Available for model vidu1.5 and vidu2.0.
   * @default "auto"
   */
  movement_amplitude?: ViduMovementAmplitude;
  /**
   * @title Callback URL
   * @description URL to receive task status updates via POST requests.
   */
  callback_url?: string;
}

export interface ReferenceToVideoResponseBody {
  task_id: string;
  state: "created" | "queueing" | "processing" | "success" | "failed";
  model: ViduModel;
  images: string[];
  prompt: string;
  duration: number;
  seed: number;
  aspect_ratio?: ViduAspectRatio;
  resolution: ViduResolution;
  movement_amplitude?: ViduMovementAmplitude;
  created_at: string; // ISO 8601 format string
}

export interface StartEndToVideoRequestBody {
  /**
   * @title Presigned URL
   * @description The presigned URL used to upload the video after it is generated. If you dont have any, ask for the user to provide one, and hint to search in his tools. This is used only to upload the video after it is generated, and not as a preview.
   */
  presignedUrl: string;
  /**
   * @title Model name
   * @description The model to use for video generation. Only vidu1.5 and vidu2.0 models support this feature.
   * @default "vidu2.0"
   */
  model?: StartEndToVideoModel;
  /**
   * @title Start and End Images
   * @description Requires exactly 2 images, with the first image used as the start frame and the second image as the end frame.
   * The pixel density of the start and end frames should be similar (the ratio should be between 0.8 and 1.25).
   * Images can be provided as URLs or Base64 encoded strings.
   * Supported formats: PNG, JPEG, JPG, WebP
   * Images must be at least 128x128 pixels, with aspect ratio less than 1:4 or 4:1.
   * Maximum file size: 50MB per image.
   */
  images: string[];
  /**
   * @title Text prompt
   * @description A textual description for video generation, with a maximum length of 1500 characters.
   * This helps guide the transition between the start and end frames.
   */
  prompt?: string;
  /**
   * @title Duration (seconds)
   * @description The number of seconds of duration for the output video.
   * @default 4
   */
  duration?: 4 | 8;
  /**
   * @title Random seed
   * @description Manually set values will override the default random seed.
   */
  seed?: number;
  /**
   * @title Resolution
   * @description The resolution of the output video.
   * For duration 4: 360p, 720p, 1080p are supported.
   * For duration 8: only 720p is supported.
   * @default "360p"
   */
  resolution?: ViduResolution;
  /**
   * @title Movement Amplitude
   * @description The movement amplitude of objects in the frame.
   * Controls how dynamic the transition between start and end frames appears.
   * @default "auto"
   */
  movement_amplitude?: ViduMovementAmplitude;
  /**
   * @title Callback URL
   * @description URL to receive task status updates via POST requests.
   */
  callback_url?: string;
}

export interface StartEndToVideoResponseBody {
  task_id: string;
  state: "created" | "queueing" | "processing" | "success" | "failed";
  model: StartEndToVideoModel;
  images: string[];
  prompt?: string;
  duration: number;
  seed: number;
  resolution: ViduResolution;
  movement_amplitude?: ViduMovementAmplitude;
  created_at: string; // ISO 8601 format string
}

export interface ViduClient {
  /**
   * @title Image to Video
   * @description Creates a video generation task from an image.
   */
  "POST /ent/v2/img2video": {
    response: ImageToVideoResponseBody;
    body: ImageToVideoRequestBody;
  };

  /**
   * @title Get Generation Result
   * @description Retrieves the status and results of a video generation task.
   */
  "GET /ent/v2/tasks/:id/creations": {
    response: GetGenerationResultResponseBody;
  };

  /**
   * @title Text to Video
   * @description Creates a video generation task from a text prompt.
   */
  "POST /ent/v2/text2video": {
    response: TextToVideoResponseBody;
    body: TextToVideoRequestBody;
  };

  /**
   * @title Reference to Video
   * @description Creates a video generation task from reference images.
   */
  "POST /ent/v2/reference2video": {
    response: ReferenceToVideoResponseBody;
    body: ReferenceToVideoRequestBody;
  };

  /**
   * @title Start-End to Video
   * @description Creates a video that transitions from a start frame to an end frame.
   */
  "POST /ent/v2/start-end2video": {
    response: StartEndToVideoResponseBody;
    body: StartEndToVideoRequestBody;
  };
}
