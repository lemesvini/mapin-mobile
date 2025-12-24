export interface Pin {
  id: string;
  authorId: string;
  lat: number;
  lng: number;
  content: string;
  moodScale?: number;
  feeling?: string;
  isPublic: boolean;
  eventId?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    fullName: string;
    profilePictureUrl?: string;
  };
  media: Media[];
  _count: {
    likes: number;
    comments: number;
  };
  isLiked: boolean;
}

export interface Media {
  id: string;
  url: string;
  type: "IMAGE" | "VIDEO";
  order: number;
  createdAt?: string;
}

export interface Comment {
  id: string;
  pinId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    fullName: string;
    profilePictureUrl?: string;
  };
}

export interface Like {
  id: string;
  pinId: string;
  userId: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    fullName: string;
    profilePictureUrl?: string;
  };
}

export interface CreatePinData {
  lat: number;
  lng: number;
  content: string;
  moodScale?: number;
  feeling?: string;
  isPublic?: boolean;
  eventId?: string;
  mediaUrls?: { url: string; type: "IMAGE" | "VIDEO" }[];
}

export interface UpdatePinData {
  content?: string;
  moodScale?: number;
  feeling?: string;
  isPublic?: boolean;
}

export interface PinsResponse {
  pins: Pin[];
  total: number;
}

export interface CommentsResponse {
  comments: Comment[];
  total: number;
}

export interface LikesResponse {
  likes: Like[];
  total: number;
}

