import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { Pin, Comment } from "@/types/pin";
import {
  View,
  Image,
  TouchableOpacity,
  Pressable,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatDistanceToNow } from "@/utils/date";
import { useState, useEffect, useCallback } from "react";
import { pinService } from "@/services/pin.service";
import { useAuth } from "@/contexts/auth.context";
import { router } from "expo-router";

interface PinCardProps {
  pin: Pin;
  onLike?: (pinId: string) => void;
  onComment?: (pinId: string) => void;
  onPress?: (pinId: string) => void;
}

export function PinCard({ pin, onLike, onComment, onPress }: PinCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(pin.isLiked);
  const [likesCount, setLikesCount] = useState(pin._count.likes);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentsCount, setCommentsCount] = useState(pin._count.comments);

  const loadComments = useCallback(async () => {
    setIsLoadingComments(true);
    try {
      const response = await pinService.getComments(pin.id, { limit: 50 });
      setComments(response.comments);
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  }, [pin.id]);

  useEffect(() => {
    if (showComments && comments.length === 0) {
      loadComments();
    }
  }, [showComments, comments.length, loadComments]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    onLike?.(pin.id);
  };

  const handleToggleComments = () => {
    setShowComments(!showComments);
    onComment?.(pin.id);
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !user) return;

    setIsSubmittingComment(true);
    try {
      await pinService.addComment(pin.id, commentText.trim());
      setCommentText("");
      setCommentsCount((prev) => prev + 1);
      await loadComments();
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(pin.createdAt));

  return (
    <Pressable
      onPress={() => onPress?.(pin.id)}
      className="border-b border-black/20 dark:border-white/20"
      style={{
        backgroundColor: isDark ? "#000" : "#fff",
      }}
    >
      <ThemedView className="px-4 py-3">
        <View className="flex-row">
          {/* Avatar */}
          <Pressable
            onPress={() => {
              router.push(`/user-profile?username=${pin.author.username}`);
            }}
            className="mr-3"
          >
            {pin.author.profilePictureUrl ? (
              <Image
                source={{ uri: pin.author.profilePictureUrl }}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <View className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 items-center justify-center">
                <ThemedText className="text-lg font-bold text-white">
                  {pin.author.fullName.charAt(0).toUpperCase()}
                </ThemedText>
              </View>
            )}
          </Pressable>

          {/* Content */}
          <View className="flex-1">
            {/* Header: Author info and menu */}
            <View className="flex-row items-start justify-between mb-0.5">
              <View className="flex-1 flex-row items-center flex-wrap">
                <Pressable
                  onPress={() => {
                    router.push(
                      `/user-profile?username=${pin.author.username}`
                    );
                  }}
                >
                  <ThemedText className="font-bold text-[15px] mr-1">
                    {pin.author.fullName}
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => {
                    router.push(
                      `/user-profile?username=${pin.author.username}`
                    );
                  }}
                >
                  <ThemedText
                    className="text-[15px] mr-1"
                    style={{ color: isDark ? "#71767B" : "#536471" }}
                  >
                    @{pin.author.username}
                  </ThemedText>
                </Pressable>
                <ThemedText
                  className="text-[15px]"
                  style={{ color: isDark ? "#71767B" : "#536471" }}
                >
                  · {timeAgo}
                </ThemedText>
              </View>
              <TouchableOpacity className="p-1 -mr-1 -mt-1">
                <Ionicons
                  name="ellipsis-horizontal"
                  size={16}
                  color={isDark ? "#71767B" : "#536471"}
                />
              </TouchableOpacity>
            </View>

            {/* Feeling tag */}
            {pin.feeling && (
              <View className="flex-row items-center mb-2">
                <ThemedText
                  className="text-[13px]"
                  style={{ color: isDark ? "#71767B" : "#536471" }}
                >
                  se sentindo{" "}
                </ThemedText>
                <View
                  className="px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(29, 155, 240, 0.1)"
                      : "rgba(29, 155, 240, 0.1)",
                  }}
                >
                  <ThemedText
                    className="font-semibold text-[13px]"
                    style={{ color: "#1D9BF0" }}
                  >
                    {pin.feeling}
                  </ThemedText>
                </View>
              </View>
            )}

            {/* Text content */}
            <ThemedText className="text-[15px] mb-3 leading-5">
              {pin.content}
            </ThemedText>

            {/* Media */}
            {pin.media && pin.media.length > 0 && (
              <View className="mb-3 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
                <Image
                  source={{ uri: pin.media[0].url }}
                  className="w-full h-80"
                  resizeMode="cover"
                />
                {pin.media.length > 1 && (
                  <View className="absolute top-2 right-2 bg-black/75 px-2.5 py-1 rounded-full">
                    <ThemedText className="text-white text-xs font-semibold">
                      1 / {pin.media.length}
                    </ThemedText>
                  </View>
                )}
              </View>
            )}

            {/* Action buttons */}
            <View className="flex-row items-center justify-start gap-2 -ml-2 mt-1">
              {/* Retweet/Share placeholder */}
              {/* <TouchableOpacity
                className="flex-row items-center px-2 py-1.5 rounded-full active:bg-green-500/10"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name="repeat-outline"
                  size={20}
                  color={isDark ? "#71767B" : "#536471"}
                />
              </TouchableOpacity> */}

              {/* Like */}
              <TouchableOpacity
                onPress={handleLike}
                className="flex-row items-center px-2 py-1.5 rounded-full active:bg-pink-500/10"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={isLiked ? "heart" : "heart-outline"}
                  size={18}
                  color={isLiked ? "#F91880" : isDark ? "#71767B" : "#536471"}
                />
                {likesCount > 0 && (
                  <ThemedText
                    className="ml-1.5 text-[13px]"
                    style={{
                      color: isLiked
                        ? "#F91880"
                        : isDark
                        ? "#71767B"
                        : "#536471",
                    }}
                  >
                    {likesCount}
                  </ThemedText>
                )}
              </TouchableOpacity>

              {/* Comment */}
              <TouchableOpacity
                onPress={handleToggleComments}
                className="flex-row items-center px-2 py-1.5 rounded-full active:bg-blue-500/10"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={showComments ? "chatbubble" : "chatbubble-outline"}
                  size={18}
                  color={
                    showComments ? "#1D9BF0" : isDark ? "#71767B" : "#536471"
                  }
                />
                {commentsCount > 0 && (
                  <ThemedText
                    className="ml-1.5 text-[13px]"
                    style={{
                      color: showComments
                        ? "#1D9BF0"
                        : isDark
                        ? "#71767B"
                        : "#536471",
                    }}
                  >
                    {commentsCount}
                  </ThemedText>
                )}
              </TouchableOpacity>

              {/* Share */}
              {/* <TouchableOpacity
                className="px-2 py-1.5 rounded-full active:bg-blue-500/10"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name="share-outline"
                  size={18}
                  color={isDark ? "#71767B" : "#536471"}
                />
              </TouchableOpacity> */}

              {/* Bookmark */}
              {/* <TouchableOpacity
                className="px-2 py-1.5 rounded-full active:bg-blue-500/10"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name="bookmark-outline"
                  size={18}
                  color={isDark ? "#71767B" : "#536471"}
                />
              </TouchableOpacity> */}
            </View>

            {/* Comments section */}
            {showComments && (
              <View
                className="mt-4 pt-4"
                style={{
                  borderTopWidth: 1,
                  borderTopColor: isDark ? "#2F3336" : "#EFF3F4",
                }}
              >
                {/* Comment input */}
                {user && (
                  <View className="flex-row">
                    {/* {user.profilePictureUrl ? (
                      <Image
                        source={{ uri: user.profilePictureUrl }}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                    ) : (
                      <View className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 items-center justify-center mr-2">
                        <ThemedText className="text-sm font-bold text-white">
                          {user.fullName.charAt(0).toUpperCase()}
                        </ThemedText>
                      </View>
                    )} */}
                    <View className="flex-1 flex-row gap-2 items-center">
                      <TextInput
                        value={commentText}
                        onChangeText={setCommentText}
                        placeholder="Responder..."
                        placeholderTextColor={isDark ? "#71767B" : "#536471"}
                        className="flex-1 text-[15px border border-black/20 dark:border-white/20 rounded-full p-2"
                        style={{
                          color: isDark ? "#E7E9EA" : "#0F1419",
                          backgroundColor: "transparent",
                        }}
                        multiline
                        maxLength={280}
                      />
                      <View className="flex-row justify-end items-center">
                        {/* <ThemedText
                          className="text-xs mr-3"
                          style={{
                            color:
                              commentText.length > 240
                                ? "#F4212E"
                                : isDark
                                ? "#71767B"
                                : "#536471",
                          }}
                        >
                          {commentText.length}/280
                        </ThemedText> */}
                        <TouchableOpacity
                          onPress={handleSubmitComment}
                          disabled={!commentText.trim() || isSubmittingComment}
                          className="px-4 py-1.5 rounded-full"
                          style={{
                            backgroundColor:
                              commentText.trim() && !isSubmittingComment
                                ? "#1D9BF0"
                                : isDark
                                ? "#0E4465"
                                : "#94D3F5",
                            opacity:
                              commentText.trim() && !isSubmittingComment
                                ? 1
                                : 0.5,
                          }}
                        >
                          {isSubmittingComment ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <>
                              <Ionicons name="send" size={18} color="#fff" />
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}

                {/* Comments list */}
                {isLoadingComments ? (
                  <View className="py-8 items-center">
                    <ActivityIndicator size="small" color="#1D9BF0" />
                  </View>
                ) : comments.length > 0 ? (
                  <View>
                    {comments.map((comment, index) => (
                      <View
                        key={comment.id}
                        className="flex-row py-3"
                        style={{
                          borderTopWidth: index > 0 ? 1 : 0,
                          borderTopColor: isDark ? "#2F3336" : "#EFF3F4",
                        }}
                      >
                        <Pressable
                          onPress={() => {
                            router.push(
                              `/user-profile?username=${comment.author.username}`
                            );
                          }}
                        >
                          {comment.author.profilePictureUrl ? (
                            <Image
                              source={{ uri: comment.author.profilePictureUrl }}
                              className="w-8 h-8 rounded-full mr-2"
                            />
                          ) : (
                            <View className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 items-center justify-center mr-2">
                              <ThemedText className="text-sm font-bold text-white">
                                {comment.author.fullName
                                  .charAt(0)
                                  .toUpperCase()}
                              </ThemedText>
                            </View>
                          )}
                        </Pressable>
                        <View className="flex-1">
                          <View className="flex-row items-center mb-1 flex-wrap">
                            <Pressable
                              onPress={() => {
                                router.push(
                                  `/user-profile?username=${comment.author.username}`
                                );
                              }}
                            >
                              <ThemedText className="font-bold text-[15px] mr-1">
                                {comment.author.fullName}
                              </ThemedText>
                            </Pressable>
                            <Pressable
                              onPress={() => {
                                router.push(
                                  `/user-profile?username=${comment.author.username}`
                                );
                              }}
                            >
                              <ThemedText
                                className="text-[15px] mr-1"
                                style={{
                                  color: isDark ? "#71767B" : "#536471",
                                }}
                              >
                                @{comment.author.username}
                              </ThemedText>
                            </Pressable>
                            <ThemedText
                              className="text-[15px]"
                              style={{ color: isDark ? "#71767B" : "#536471" }}
                            >
                              ·{" "}
                              {formatDistanceToNow(new Date(comment.createdAt))}
                            </ThemedText>
                          </View>
                          <ThemedText className="text-[15px] leading-5">
                            {comment.content}
                          </ThemedText>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View className="py-8 items-center">
                    <Ionicons
                      name="chatbubbles-outline"
                      size={32}
                      color={isDark ? "#2F3336" : "#CFD9DE"}
                    />
                    <ThemedText
                      className="text-sm mt-2"
                      style={{ color: isDark ? "#71767B" : "#536471" }}
                    >
                      Nenhum comentário ainda
                    </ThemedText>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </ThemedView>
    </Pressable>
  );
}
