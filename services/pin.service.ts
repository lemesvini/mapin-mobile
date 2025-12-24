import api from "./api";
import {
  Pin,
  PinsResponse,
  CreatePinData,
  UpdatePinData,
  CommentsResponse,
  LikesResponse,
} from "@/types/pin";

export const pinService = {
  // Get all pins with filters
  getPins: async (params?: {
    authorId?: string;
    lat?: number;
    lng?: number;
    radius?: number;
    isPublic?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<PinsResponse> => {
    const response = await api.get<PinsResponse>("/pins", { params });
    return response.data;
  },

  // Get a single pin
  getPin: async (pinId: string): Promise<Pin> => {
    const response = await api.get<{ pin: Pin }>(`/pins/${pinId}`);
    return response.data.pin;
  },

  // Create a new pin
  createPin: async (data: CreatePinData): Promise<Pin> => {
    const response = await api.post<{ pin: Pin }>("/pins", data);
    return response.data.pin;
  },

  // Update a pin
  updatePin: async (pinId: string, data: UpdatePinData): Promise<Pin> => {
    const response = await api.put<{ pin: Pin }>(`/pins/${pinId}`, data);
    return response.data.pin;
  },

  // Delete a pin
  deletePin: async (pinId: string): Promise<void> => {
    await api.delete(`/pins/${pinId}`);
  },

  // Like a pin
  likePin: async (pinId: string): Promise<void> => {
    await api.post(`/pins/${pinId}/like`);
  },

  // Unlike a pin
  unlikePin: async (pinId: string): Promise<void> => {
    await api.delete(`/pins/${pinId}/like`);
  },

  // Get likes for a pin
  getLikes: async (
    pinId: string,
    params?: { limit?: number; offset?: number }
  ): Promise<LikesResponse> => {
    const response = await api.get<LikesResponse>(`/pins/${pinId}/likes`, {
      params,
    });
    return response.data;
  },

  // Add a comment
  addComment: async (pinId: string, content: string): Promise<void> => {
    await api.post(`/pins/${pinId}/comments`, { content });
  },

  // Get comments for a pin
  getComments: async (
    pinId: string,
    params?: { limit?: number; offset?: number }
  ): Promise<CommentsResponse> => {
    const response = await api.get<CommentsResponse>(
      `/pins/${pinId}/comments`,
      { params }
    );
    return response.data;
  },

  // Delete a comment
  deleteComment: async (pinId: string, commentId: string): Promise<void> => {
    await api.delete(`/pins/${pinId}/comments/${commentId}`);
  },

  // Get pins by user (helper method)
  getUserPins: async (
    userId: string,
    params?: { limit?: number; offset?: number }
  ): Promise<PinsResponse> => {
    const requestParams = { authorId: userId, ...params };
    console.log("getUserPins - userId:", userId);
    console.log("getUserPins - request params:", JSON.stringify(requestParams));
    try {
      const response = await api.get<PinsResponse>("/pins", {
        params: requestParams,
      });
      console.log("getUserPins - full response:", JSON.stringify(response.data, null, 2));
      console.log("getUserPins - response status:", response.status);
      console.log("getUserPins - pins count:", response.data.pins?.length || 0);
      return response.data;
    } catch (error: any) {
      console.error("getUserPins - error:", error);
      console.error("getUserPins - error response:", error.response?.data);
      throw error;
    }
  },
};
