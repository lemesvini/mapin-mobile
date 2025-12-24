# API Usage Guide

This document explains how to use the refactored API structure in the mobile app.

## Configuration

API configuration is centralized in `config/api.config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? "http://localhost:3333"  // Local development
    : "https://mapin-api-production-2f0a.up.railway.app", // Production
  TIMEOUT: 10000,
  HEADERS: {
    "Content-Type": "application/json",
  },
};
```

Update the `BASE_URL` based on your environment:
- **iOS Simulator**: Use `http://localhost:3333` or your machine's IP
- **Android Emulator**: Use `http://10.0.2.2:3333`
- **Physical Device**: Use your machine's local IP (e.g., `http://192.168.1.X:3333`)
- **Production**: Use your Railway URL

## Using the `useApi` Hook

The `useApi` hook provides a centralized way to access all API services:

### Example 1: Fetching Pins

```tsx
import { useApi } from "@/hooks/use-api";
import { useState, useEffect } from "react";

export function PinsScreen() {
  const api = useApi();
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPins() {
      try {
        const response = await api.pins.getPins({
          limit: 20,
          isPublic: true,
        });
        setPins(response.pins);
      } catch (error) {
        console.error("Failed to load pins:", error);
      } finally {
        setLoading(false);
      }
    }

    loadPins();
  }, []);

  // ... render UI
}
```

### Example 2: Creating a Pin

```tsx
import { useApi } from "@/hooks/use-api";

export function CreatePinScreen() {
  const api = useApi();

  const handleCreatePin = async (data: CreatePinData) => {
    try {
      const newPin = await api.pins.createPin(data);
      console.log("Pin created:", newPin);
      // Navigate or show success message
    } catch (error) {
      console.error("Failed to create pin:", error);
    }
  };

  // ... render form
}
```

### Example 3: Liking a Pin

```tsx
import { useApi } from "@/hooks/use-api";

export function PinCard({ pin }) {
  const api = useApi();
  const [isLiked, setIsLiked] = useState(pin.isLiked);

  const handleLike = async () => {
    try {
      if (isLiked) {
        await api.pins.unlikePin(pin.id);
      } else {
        await api.pins.likePin(pin.id);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  // ... render UI with like button
}
```

### Example 4: Managing Comments

```tsx
import { useApi } from "@/hooks/use-api";

export function CommentsSection({ pinId }) {
  const api = useApi();
  const [comments, setComments] = useState([]);

  // Load comments
  useEffect(() => {
    async function loadComments() {
      const response = await api.pins.getComments(pinId);
      setComments(response.comments);
    }
    loadComments();
  }, [pinId]);

  // Add a comment
  const handleAddComment = async (content: string) => {
    try {
      await api.pins.addComment(pinId, content);
      // Refresh comments
      const response = await api.pins.getComments(pinId);
      setComments(response.comments);
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  // ... render UI
}
```

## Available API Methods

### Authentication (`api.auth`)

- `login(credentials)` - Login user
- `register(credentials)` - Register new user
- `getCurrentUser(token)` - Get current user profile

### Users & Follow (`api.users`)

- `getUserProfile(username)` - Get user profile by username
- `followUser(userId)` - Follow a user (or send request if private)
- `unfollowUser(userId)` - Unfollow a user
- `removeFollower(userId)` - Remove a follower
- `cancelFollowRequest(userId)` - Cancel a follow request
- `acceptFollowRequest(requestId)` - Accept a follow request
- `rejectFollowRequest(requestId)` - Reject a follow request
- `getFollowers(userId, params?)` - Get user's followers
- `getFollowing(userId, params?)` - Get users that user is following
- `getPendingRequests(params?)` - Get pending follow requests (received)
- `getSentRequests(params?)` - Get sent follow requests

### Pins (`api.pins`)

- `getPins(params?)` - Get all pins with optional filters
- `getPin(pinId)` - Get a single pin
- `createPin(data)` - Create a new pin
- `updatePin(pinId, data)` - Update a pin
- `deletePin(pinId)` - Delete a pin
- `likePin(pinId)` - Like a pin
- `unlikePin(pinId)` - Unlike a pin
- `getLikes(pinId, params?)` - Get likes for a pin
- `addComment(pinId, content)` - Add a comment
- `getComments(pinId, params?)` - Get comments for a pin
- `deleteComment(pinId, commentId)` - Delete a comment

### Auth Token Management (`api.setAuthToken`)

- `setAuthToken(token)` - Set or clear auth token for all requests

Note: The auth token is automatically managed by the `AuthProvider`, so you typically don't need to call this manually.

## Benefits of This Refactoring

1. **Single Source of Truth**: API URL is configured once in `config/api.config.ts`
2. **Unified API Instance**: All services use the same axios instance with consistent configuration
3. **Easy to Use**: Import one hook instead of multiple services
4. **Type Safety**: Full TypeScript support for all API methods
5. **Automatic Token Management**: Auth tokens are handled automatically by the context
6. **Environment-Aware**: Automatically switches between dev and production URLs

