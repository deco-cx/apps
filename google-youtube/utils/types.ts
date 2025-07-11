// notice that here we have the types for the return of the API calls
// you can use https://quicktype.io/ to convert JSON to typescript

export interface Query {
  part: string;
  mine?: boolean;
}

export interface VideoQuery {
  part: string;
  channelId?: string;
  maxResults?: number;
  order?: string;
  type?: string;
  pageToken?: string;
  q?: string;
  publishedAfter?: string;
  publishedBefore?: string;
  videoCategoryId?: string;
  regionCode?: string;
  relevanceLanguage?: string;
  forMine?: boolean;
  videoDuration?: "short" | "medium" | "long"; // short: <4min, medium: 4-20min, long: >20min
}

export type PrivacyStatus = "public" | "private" | "unlisted";

type Kind =
  | "youtube#video"
  | "youtube#playlist"
  | "youtube#channel"
  | "youtube#comment"
  | "youtube#commentThread"
  | "youtube#live";

interface Base {
  kind: Kind;
  etag: string;
  id: string;
}

interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

interface Snippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: {
    default: Thumbnail;
    medium: Thumbnail;
    high: Thumbnail;
    standard?: Thumbnail;
  };
  channelTitle: string;
  tags?: string[];
  categoryId: string;
  liveBroadcastContent: string;
  localized: {
    title: string;
    description: string;
  };
  defaultAudioLanguage?: string;
  defaultLanguage?: string;
  country?: string;
  topicCategories?: string[];
}

interface Status {
  categoryId: string;
  liveBroadcastContent: string;
  localized: {
    title: string;
    description: string;
  };
}

interface Statistics {
  viewCount: string;
  likeCount: string;
  dislikeCount?: string;
  favoriteCount: string;
  commentCount: string;
}

interface Status {
  uploadStatus: string;
  privacyStatus: string;
  license: string;
  embeddable: boolean;
  publicStatsViewable: boolean;
  madeForKids?: boolean;
}

interface Video extends Base {
  kind: "youtube#video";
  etag: string;
  id: string;
  snippet: Snippet;
  status: Status;
  statistics: Statistics;
}

export interface YoutubeVideoListResponse {
  kind: "youtube#videoListResponse";
  etag: string;
  items: Array<{
    kind: "youtube#video";
    etag: string;
    id: string;
    snippet: {
      publishedAt: string;
      channelId: string;
      title: string;
      description: string;
      thumbnails: {
        default: Thumbnail;
        medium: Thumbnail;
        high: Thumbnail;
        standard?: Thumbnail;
        maxres?: Thumbnail;
      };
      channelTitle: string;
      tags?: string[];
      categoryId: string;
      liveBroadcastContent: string;
      localized: {
        title: string;
        description: string;
      };
    };
    status: {
      uploadStatus: string;
      privacyStatus: string;
      license: string;
      embeddable: boolean;
      publicStatsViewable: boolean;
      madeForKids: boolean;
    };
    statistics: {
      viewCount: string;
      likeCount: string;
      favoriteCount: string;
      commentCount: string;
    };
  }>;
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

export interface YoutubeChannelResponse {
  kind: string;
  items: Array<{
    id: string;
    snippet: Snippet;
    contentDetails?: {
      relatedPlaylists: {
        uploads: string;
        likes?: string;
        favorites?: string;
        watchHistory?: string;
      };
    };
    brandingSettings?: {
      channel?: {
        title?: string;
        description?: string;
        keywords?: string;
        defaultLanguage?: string;
        country?: string;
        unsubscribedTrailer?: string;
      };
      image?: {
        bannerExternalUrl?: string;
      };
      hints?: Array<{
        property?: string;
        value?: string;
      }>;
      defaults?: {
        defaultLanguage?: string;
        defaultPrivacy?: string;
        privacyStatus?: string;
        license?: string;
        embeddable?: boolean;
        publicStatsViewable?: boolean;
        autoLevels?: boolean;
        commentingStatus?: string;
        categoryId?: string;
        tags?: string[];
        enableAutoShare?: boolean;
      };
    };
  }>;
  brandingSettings?: {
    channel?: {
      title?: string;
      description?: string;
      keywords?: string;
      defaultLanguage?: string;
      country?: string;
      unsubscribedTrailer?: string;
    };
    image?: {
      bannerExternalUrl?: string;
    };
    hints?: Array<{
      property?: string;
      value?: string;
    }>;
    defaults?: {
      defaultLanguage?: string;
      defaultPrivacy?: string;
      privacyStatus?: string;
      license?: string;
      embeddable?: boolean;
      publicStatsViewable?: boolean;
      autoLevels?: boolean;
      commentingStatus?: string;
      categoryId?: string;
      tags?: string[];
      enableAutoShare?: boolean;
    };
  };
}

export interface YoutubeVideoResponse {
  kind: string;
  pageInfo?: {
    totalResults: number;
    resultsPerPage: number;
  };
  nextPageToken?: string;
  prevPageToken?: string;
  regionCode?: string;
  isAuthenticated?: boolean;
  items: Array<{
    id: string | {
      kind: string;
      videoId: string;
    };
    snippet: {
      publishedAt: string;
      channelId: string;
      title: string;
      description: string;
      channelTitle?: string;
      thumbnails: {
        default: Thumbnail;
        medium?: Thumbnail;
        high?: Thumbnail;
        standard?: Thumbnail;
        maxres?: Thumbnail;
      };
      tags?: string[];
      categoryId?: string;
      liveBroadcastContent?: string;
      defaultLanguage?: string;
      localized?: {
        title: string;
        description: string;
      };
    };
    statistics?: Statistics;
    contentDetails?: {
      duration: string;
      dimension: string;
      definition: string;
      caption: string;
      licensedContent: boolean;
      projection: string;
    };
    isShort?: boolean;
    durationInSeconds?: number;
  }>;
}

export interface UpdateThumbnailResponse {
  kind: string;
  etag: string;
  videoId: string;
  items: Array<{
    default: Thumbnail;
    medium?: Thumbnail;
    high?: Thumbnail;
    standard?: Thumbnail;
    maxres?: Thumbnail;
  }>;
}

export interface YouTubeCommentThread {
  kind: "youtube#commentThread";
  etag: string;
  id: string;
  snippet: {
    videoId: string;
    topLevelComment: {
      kind: "youtube#comment";
      etag: string;
      id: string;
      snippet: {
        authorDisplayName: string;
        authorProfileImageUrl: string;
        authorChannelUrl: string;
        textOriginal: string;
        likeCount: number;
        publishedAt: string;
        updatedAt: string;
      };
    };
    totalReplyCount: number;
  };
}

export interface YouTubeCommentThreadListResponse {
  kind: "youtube#commentThreadListResponse";
  etag: string;
  items: YouTubeCommentThread[];
  nextPageToken?: string;
  pageInfo?: {
    totalResults: number;
    resultsPerPage: number;
  };
  commentsDisabled?: boolean;
}

export interface YouTubeCaptionListResponse {
  kind: "youtube#captionListResponse";
  etag: string;
  items: YouTubeCaption[];
}

export interface YouTubeCaption {
  kind: "youtube#caption";
  etag: string;
  id: string;
  snippet: {
    videoId: string;
    language: string;
    name: string;
    audioTrackType: string; // "standard" ou "ASR" (auto-generated)
    isDraft: boolean;
    isAutoSynced: boolean;
    isCC: boolean; // Closed captions (legendas ocultas)
    trackKind: string; // "standard" ou "ASR" (auto-generated)
    status: string; // "serving" ou "syncing" ou "failed"
    lastUpdated: string;
  };
}

// Tipos para transmissões ao vivo
export type LiveBroadcastLifeCycleStatus =
  | "complete" // A transmissão está concluída
  | "created" // A transmissão foi criada, mas não está agendada
  | "live" // A transmissão está ao vivo
  | "liveStarting" // A transmissão está começando (apenas adquirível, não configurável)
  | "ready" // A transmissão está agendada para começar
  | "revoked" // A transmissão foi removida
  | "testStarting" // O teste da transmissão está começando (apenas adquirível, não configurável)
  | "testing"; // A transmissão está em teste

export type LiveBroadcastPrivacyStatus = "private" | "public" | "unlisted";

export type LiveStreamStatusState =
  | "active" // O stream está ativo e pronto para uso
  | "created" // O stream foi criado, mas não está ativo
  | "error" // Houve um erro na criação do stream
  | "inactive"; // O stream está inativo

export interface LiveBroadcastSnippet {
  title: string;
  description?: string;
  publishedAt?: string;
  channelId?: string;
  thumbnails?: {
    default?: Thumbnail;
    medium?: Thumbnail;
    high?: Thumbnail;
    standard?: Thumbnail;
    maxres?: Thumbnail;
  };
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  isDefaultBroadcast?: boolean;
  liveChatId?: string;
}

export interface LiveBroadcastContentDetails {
  boundStreamId?: string;
  boundStreams?: Array<{
    streamId: string;
  }>;
  monitorStream?: {
    enableMonitorStream?: boolean;
    broadcastStreamDelayMs?: number;
    embedHtml?: string;
  };
  enableAutoStart?: boolean;
  enableAutoStop?: boolean;
  enableDvr?: boolean;
  enableContentEncryption?: boolean;
  enableEmbed?: boolean;
  recordFromStart?: boolean;
  startWithSlate?: boolean;
  closedCaptionsType?: string;
  projection?: string;
  enableLowLatency?: boolean;
  latencyPreference?: string;
  enableAutoStartStopForDVR?: boolean;
}

export interface LiveBroadcastStatusInfo {
  lifeCycleStatus: LiveBroadcastLifeCycleStatus;
  privacyStatus: LiveBroadcastPrivacyStatus;
  recordingStatus?: string;
  madeForKids?: boolean;
  selfDeclaredMadeForKids?: boolean;
}

export interface LiveBroadcast {
  kind: "youtube#liveBroadcast";
  etag: string;
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default?: Thumbnail;
      medium?: Thumbnail;
      high?: Thumbnail;
      standard?: Thumbnail;
      maxres?: Thumbnail;
    };
    scheduledStartTime: string;
    scheduledEndTime?: string;
    actualStartTime?: string;
    actualEndTime?: string;
    isDefaultBroadcast?: boolean;
    liveChatId?: string;
  };
  status: {
    lifeCycleStatus: LiveBroadcastLifeCycleStatus;
    privacyStatus: LiveBroadcastPrivacyStatus;
    recordingStatus: "notRecording" | "recording" | "recorded";
    madeForKids?: boolean;
    selfDeclaredMadeForKids?: boolean;
  };
  contentDetails: {
    boundStreamId?: string;
    boundStreamLastUpdateTimeMs?: string;
    monitorStream?: {
      enableMonitorStream: boolean;
      broadcastStreamDelayMs?: number;
      embedHtml?: string;
    };
    enableEmbed?: boolean;
    enableDvr?: boolean;
    enableContentEncryption?: boolean;
    startWithSlate?: boolean;
    recordFromStart?: boolean;
    enableClosedCaptions?: boolean;
    closedCaptionsType?: string;
    projection?: string;
    enableLowLatency?: boolean;
    latencyPreference?: string;
    enableAutoStart?: boolean;
    enableAutoStop?: boolean;
  };
  statistics?: {
    totalChatCount?: number;
    concurrentViewers?: string;
  };
}

export interface LiveBroadcastListResponse {
  kind: "youtube#liveBroadcastListResponse";
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: LiveBroadcast[];
  infoMessage?: string;
}

export interface LiveStreamSnippet {
  title: string;
  description?: string;
  publishedAt?: string;
  channelId?: string;
  isDefaultStream?: boolean;
}

export interface LiveStreamCdn {
  ingestionType: "rtmp" | "dash" | "webrtc";
  ingestionInfo?: {
    streamName: string;
    ingestionAddress: string;
    backupIngestionAddress?: string;
    rtmpsIngestionAddress?: string;
    rtmpsBackupIngestionAddress?: string;
  };
  resolution?: string;
  frameRate?: string;
}

export interface LiveStreamContentDetails {
  closedCaptionsIngestionUrl?: string;
  isReusable?: boolean;
}

export interface LiveStreamStatusInfo {
  streamStatus: LiveStreamStatusState;
  healthStatus?: {
    status: "good" | "acceptable" | "bad" | "noData";
    lastUpdateTimeSeconds?: string;
    reason?: string;
  };
}

export interface LiveStream {
  kind: "youtube#liveStream";
  etag: string;
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    isDefaultStream?: boolean;
  };
  cdn: {
    format?: string;
    ingestionType: "rtmp" | "dash" | "webrtc";
    ingestionInfo?: {
      streamName: string;
      ingestionAddress: string;
      backupIngestionAddress?: string;
      rtmpsIngestionAddress?: string;
      rtmpsBackupIngestionAddress?: string;
    };
    resolution?: string;
    frameRate?: string;
  };
  status: {
    streamStatus: "active" | "created" | "error" | "inactive" | "ready";
    healthStatus: {
      status: "good" | "ok" | "bad" | "noData";
      lastUpdateTimeSeconds?: string;
    };
  };
  contentDetails: {
    closedCaptionsIngestionUrl?: string;
    isReusable: boolean;
  };
}

export interface LiveStreamListResponse {
  kind: "youtube#liveStreamListResponse";
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: LiveStream[];
  infoMessage?: string; // Mensagem informativa adicional
}

export interface YoutubePlaylistItemsResponse {
  kind: "youtube#playlistItemListResponse";
  etag: string;
  items: Array<{
    kind: "youtube#playlistItem";
    etag: string;
    id: string;
    snippet: {
      publishedAt: string;
      channelId: string;
      title: string;
      description: string;
      thumbnails: {
        default: Thumbnail;
        medium?: Thumbnail;
        high?: Thumbnail;
        standard?: Thumbnail;
        maxres?: Thumbnail;
      };
      channelTitle: string;
      playlistId: string;
      position: number;
      resourceId: {
        kind: string;
        videoId: string;
      };
      videoOwnerChannelTitle?: string;
      videoOwnerChannelId?: string;
    };
    contentDetails?: {
      videoId: string;
      startAt?: string;
      endAt?: string;
      note?: string;
      videoPublishedAt: string;
    };
    status?: {
      privacyStatus: PrivacyStatus;
    };
  }>;
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

export interface youtubeTokenResponse {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expires_in: number;
}

export interface VideoCategory {
  id: string;
  snippet: {
    title: string;
    assignable: boolean;
    channelId: string;
  };
}

export interface YoutubeCategoryListResponse {
  kind: string;
  etag: string;
  items: VideoCategory[];
  error?: {
    code: number;
    message: string;
    details?: unknown;
  };
}

export type LegendOptions = "sbv" | "scc" | "srt" | "ttml" | "vtt";
