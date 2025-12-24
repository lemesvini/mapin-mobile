import api from "./api";
import {
  User,
  FollowersResponse,
  FollowingResponse,
  FollowRequestsResponse,
  FollowResponse,
  UserProfileResponse,
  SearchUsersResponse,
} from "@/types/user";

export const userService = {
  /**
   * Search users by username or full name
   */
  searchUsers: async (
    query: string,
    params?: { limit?: number; offset?: number }
  ): Promise<SearchUsersResponse> => {
    const response = await api.get<SearchUsersResponse>("/users/search", {
      params: { q: query, ...params },
    });
    return response.data;
  },

  /**
   * Get user profile by username
   */
  getUserProfile: async (username: string): Promise<User> => {
    const response = await api.get<UserProfileResponse>(`/users/${username}`);
    return response.data.user;
  },

  /**
   * Follow a user
   */
  followUser: async (userId: string): Promise<FollowResponse> => {
    const response = await api.post<FollowResponse>(`/users/${userId}/follow`);
    return response.data;
  },

  /**
   * Unfollow a user
   */
  unfollowUser: async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}/follow`);
  },

  /**
   * Remove a follower
   */
  removeFollower: async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}/follower`);
  },

  /**
   * Cancel a follow request
   */
  cancelFollowRequest: async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}/follow-request`);
  },

  /**
   * Accept a follow request
   */
  acceptFollowRequest: async (requestId: string): Promise<void> => {
    await api.post(`/users/follow-requests/${requestId}/accept`);
  },

  /**
   * Reject a follow request
   */
  rejectFollowRequest: async (requestId: string): Promise<void> => {
    await api.post(`/users/follow-requests/${requestId}/reject`);
  },

  /**
   * Get followers of a user
   */
  getFollowers: async (
    userId: string,
    params?: { limit?: number; offset?: number }
  ): Promise<FollowersResponse> => {
    const response = await api.get<FollowersResponse>(
      `/users/${userId}/followers`,
      { params }
    );
    return response.data;
  },

  /**
   * Get users that a user is following
   */
  getFollowing: async (
    userId: string,
    params?: { limit?: number; offset?: number }
  ): Promise<FollowingResponse> => {
    const response = await api.get<FollowingResponse>(
      `/users/${userId}/following`,
      { params }
    );
    return response.data;
  },

  /**
   * Get pending follow requests (received)
   */
  getPendingRequests: async (params?: {
    limit?: number;
    offset?: number;
  }): Promise<FollowRequestsResponse> => {
    const response = await api.get<FollowRequestsResponse>(
      "/users/follow-requests/pending",
      { params }
    );
    return response.data;
  },

  /**
   * Get sent follow requests
   */
  getSentRequests: async (params?: {
    limit?: number;
    offset?: number;
  }): Promise<FollowRequestsResponse> => {
    const response = await api.get<FollowRequestsResponse>(
      "/users/follow-requests/sent",
      { params }
    );
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: {
    bio?: string;
    profilePictureUrl?: string;
    fullName?: string;
    instagramUsername?: string;
  }): Promise<User> => {
    const response = await api.patch<{ user: User }>("/auth/me", data);
    return response.data.user;
  },
};
