/**
 * User Types
 */

export interface User {
  id: string;
  username: string;
  fullName: string;
  email?: string;
  bio?: string;
  profilePictureUrl?: string;
  instagramUsername?: string;
  isPrivate: boolean;
  createdAt: string;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  followRequestStatus?: "PENDING" | "ACCEPTED" | "REJECTED" | null;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
  follower?: User;
  following?: User;
}

export interface FollowRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  sender?: User;
  receiver?: User;
}

// API Response types
export interface FollowersResponse {
  followers: User[];
  total: number;
}

export interface FollowingResponse {
  following: User[];
  total: number;
}

export interface FollowRequestsResponse {
  requests: FollowRequest[];
  total: number;
}

export interface FollowResponse {
  message: string;
  follow?: Follow;
  request?: FollowRequest;
}

export interface UserProfileResponse {
  user: User;
}

export interface SearchUsersResponse {
  users: User[];
  total: number;
}

