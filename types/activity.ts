// types/activity.ts

export interface Status {
  _id: string;
  userId: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  createdAt: string;
  viewedBy: string[];
  visibility: 'public' | 'followers';
}

export interface CurrentUserActivityData {
  _id: string;
  name: string;
  avatarUrl?: string;
  hasActiveStatus: boolean;
  allActiveStatuses: Status[];
}

export interface ConnectionActivityData {
  _id: string;
  name: string;
  avatarUrl?: string;
  hasActiveStatus: boolean;
  latestActiveStatusPreview?: {
    _id: string;
    mediaType: 'image' | 'video';
    mediaUrl: string;
    createdAt: string;
  };
}

export interface User {
  _id: string;
  name: string;
  avatarUrl?: string;
}
