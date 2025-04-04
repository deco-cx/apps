export interface Live {
  id: string;
  title: string;
  description: string;
  scheduledStartTime: Date;
  scheduledEndTime?: Date;
  actualStartTime?: Date;
  actualEndTime?: Date;
  thumbnailUrl?: string;
  status: LiveStatus;
  streamKey?: string;
  streamUrl?: string;
  playbackUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  hostName?: string;
  isPrivate: boolean;
  allowedViewers?: string[]; // IDs de usuários com permissão para visualizar lives privadas
  tags?: string[];
  category?: string;
}

export enum LiveStatus {
  SCHEDULED = "scheduled", // Agendada, ainda não iniciada
  LIVE = "live",           // Transmissão em andamento
  PAUSED = "paused",       // Temporariamente pausada
  ENDED = "ended",         // Encerrada normalmente
  CANCELLED = "cancelled", // Cancelada antes de iniciar
  FAILED = "failed"        // Falha técnica
}

export interface LiveStats {
  liveId: string;
  viewerCount: number;
  peakViewerCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
}

export interface LiveComment {
  id: string;
  liveId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  isHighlighted?: boolean;
  isHidden?: boolean;
} 