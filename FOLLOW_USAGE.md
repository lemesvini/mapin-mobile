# Follow System Usage Guide

This document explains how to use the follow/following/followers functionality in the app.

## Features

- ✅ Follow/unfollow users
- ✅ Private account support with follow requests
- ✅ Accept/reject follow requests
- ✅ Cancel sent follow requests
- ✅ Remove followers
- ✅ View followers and following lists
- ✅ View pending and sent follow requests

## API Endpoints (Backend)

### User Profile
- `GET /users/:username` - Get user profile with follow status

### Follow Actions
- `POST /users/:userId/follow` - Follow a user (or send request if private)
- `DELETE /users/:userId/follow` - Unfollow a user
- `DELETE /users/:userId/follower` - Remove a follower
- `DELETE /users/:userId/follow-request` - Cancel a follow request

### Follow Requests
- `POST /users/follow-requests/:requestId/accept` - Accept a follow request
- `POST /users/follow-requests/:requestId/reject` - Reject a follow request
- `GET /users/follow-requests/pending` - Get pending requests (received)
- `GET /users/follow-requests/sent` - Get sent requests

### Lists
- `GET /users/:userId/followers` - Get user's followers
- `GET /users/:userId/following` - Get users that user is following

## Mobile App Usage

### 1. Get User Profile

```tsx
import { useApi } from "@/hooks/use-api";
import { useState, useEffect } from "react";

export function UserProfileScreen({ username }: { username: string }) {
  const api = useApi();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const userData = await api.users.getUserProfile(username);
        setUser(userData);
        
        // userData includes:
        // - isFollowing: boolean
        // - followRequestStatus: "PENDING" | "ACCEPTED" | "REJECTED" | null
        // - followersCount: number
        // - followingCount: number
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    }
    loadProfile();
  }, [username]);

  // ... render UI
}
```

### 2. Follow a User

```tsx
import { useApi } from "@/hooks/use-api";

export function FollowButton({ userId, isPrivate }: { userId: string; isPrivate: boolean }) {
  const api = useApi();
  const [isFollowing, setIsFollowing] = useState(false);
  const [requestPending, setRequestPending] = useState(false);

  const handleFollow = async () => {
    try {
      const result = await api.users.followUser(userId);
      
      if (result.follow) {
        // User was public - followed directly
        setIsFollowing(true);
        console.log("Successfully followed user");
      } else if (result.request) {
        // User is private - request sent
        setRequestPending(true);
        console.log("Follow request sent");
      }
    } catch (error) {
      console.error("Failed to follow user:", error);
    }
  };

  return (
    <button onClick={handleFollow}>
      {requestPending ? "Request Pending" : isFollowing ? "Following" : "Follow"}
    </button>
  );
}
```

### 3. Unfollow a User

```tsx
const handleUnfollow = async (userId: string) => {
  try {
    await api.users.unfollowUser(userId);
    setIsFollowing(false);
    console.log("Successfully unfollowed user");
  } catch (error) {
    console.error("Failed to unfollow user:", error);
  }
};
```

### 4. Cancel Follow Request

```tsx
const handleCancelRequest = async (userId: string) => {
  try {
    await api.users.cancelFollowRequest(userId);
    setRequestPending(false);
    console.log("Follow request cancelled");
  } catch (error) {
    console.error("Failed to cancel request:", error);
  }
};
```

### 5. View Follow Requests (Received)

```tsx
import { useApi } from "@/hooks/use-api";
import { useState, useEffect } from "react";

export function FollowRequestsScreen() {
  const api = useApi();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    async function loadRequests() {
      try {
        const data = await api.users.getPendingRequests();
        setRequests(data.requests);
      } catch (error) {
        console.error("Failed to load requests:", error);
      }
    }
    loadRequests();
  }, []);

  const handleAccept = async (requestId: string) => {
    try {
      await api.users.acceptFollowRequest(requestId);
      // Remove from list or refetch
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (error) {
      console.error("Failed to accept request:", error);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await api.users.rejectFollowRequest(requestId);
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (error) {
      console.error("Failed to reject request:", error);
    }
  };

  return (
    <div>
      {requests.map(request => (
        <div key={request.id}>
          <p>{request.sender?.fullName} wants to follow you</p>
          <button onClick={() => handleAccept(request.id)}>Accept</button>
          <button onClick={() => handleReject(request.id)}>Reject</button>
        </div>
      ))}
    </div>
  );
}
```

### 6. View Followers

```tsx
import { useApi } from "@/hooks/use-api";

export function FollowersScreen({ userId }: { userId: string }) {
  const api = useApi();
  const [followers, setFollowers] = useState([]);

  useEffect(() => {
    async function loadFollowers() {
      try {
        const data = await api.users.getFollowers(userId, {
          limit: 50,
          offset: 0,
        });
        setFollowers(data.followers);
      } catch (error) {
        console.error("Failed to load followers:", error);
      }
    }
    loadFollowers();
  }, [userId]);

  // ... render list
}
```

### 7. View Following

```tsx
import { useApi } from "@/hooks/use-api";

export function FollowingScreen({ userId }: { userId: string }) {
  const api = useApi();
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    async function loadFollowing() {
      try {
        const data = await api.users.getFollowing(userId, {
          limit: 50,
          offset: 0,
        });
        setFollowing(data.following);
      } catch (error) {
        console.error("Failed to load following:", error);
      }
    }
    loadFollowing();
  }, [userId]);

  // ... render list
}
```

### 8. Remove a Follower

```tsx
const handleRemoveFollower = async (followerId: string) => {
  try {
    await api.users.removeFollower(followerId);
    console.log("Follower removed");
    // Refresh followers list
  } catch (error) {
    console.error("Failed to remove follower:", error);
  }
};
```

## Complete Example: User Profile Component

```tsx
import { useApi } from "@/hooks/use-api";
import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";

export function UserProfile({ username }: { username: string }) {
  const api = useApi();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userData = await api.users.getUserProfile(username);
      setUser(userData);
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) return;
    
    try {
      setActionLoading(true);
      
      if (user.isFollowing) {
        await api.users.unfollowUser(user.id);
        setUser({ ...user, isFollowing: false, followersCount: user.followersCount - 1 });
      } else if (user.followRequestStatus === "PENDING") {
        await api.users.cancelFollowRequest(user.id);
        setUser({ ...user, followRequestStatus: null });
      } else {
        const result = await api.users.followUser(user.id);
        
        if (result.follow) {
          setUser({ ...user, isFollowing: true, followersCount: user.followersCount + 1 });
        } else if (result.request) {
          setUser({ ...user, followRequestStatus: "PENDING" });
        }
      }
    } catch (error) {
      console.error("Failed to toggle follow:", error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator />;
  }

  if (!user) {
    return <Text>User not found</Text>;
  }

  const getButtonText = () => {
    if (user.isFollowing) return "Following";
    if (user.followRequestStatus === "PENDING") return "Requested";
    return "Follow";
  };

  return (
    <View>
      <Text>{user.fullName}</Text>
      <Text>@{user.username}</Text>
      <Text>{user.bio}</Text>
      
      <View style={{ flexDirection: "row" }}>
        <Text>{user.followersCount} followers</Text>
        <Text>{user.followingCount} following</Text>
      </View>

      <TouchableOpacity 
        onPress={handleFollowToggle}
        disabled={actionLoading}
      >
        <Text>{actionLoading ? "Loading..." : getButtonText()}</Text>
      </TouchableOpacity>
    </View>
  );
}
```

## Privacy Logic

1. **Public Accounts**: Following happens immediately
2. **Private Accounts**: A follow request is sent and must be approved
3. **Follow Request States**:
   - `PENDING`: Request is waiting for approval
   - `ACCEPTED`: Request was accepted (follow created)
   - `REJECTED`: Request was rejected
   - `null`: No request exists

## Best Practices

1. Always handle loading states for better UX
2. Refresh followers/following counts after actions
3. Show appropriate UI based on `isFollowing` and `followRequestStatus`
4. Handle errors gracefully with user-friendly messages
5. Consider implementing optimistic updates for better perceived performance

