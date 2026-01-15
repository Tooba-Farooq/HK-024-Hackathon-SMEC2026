"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  Heart,
  MessageCircle,
  ArrowLeft,
  UserPlus,
  UserMinus,
  Send,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

interface Post {
  id: number;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  userId: string;
  userName: string;
  userImage: string | null;
  username: string | null;
  userBio: string | null;
  likeCount?: number;
  userLiked?: boolean;
  commentCount?: number;
}

interface Comment {
  id: number;
  commentText: string;
  createdAt: string;
  userId: string;
  userName: string;
  userImage: string | null;
  username: string | null;
}

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.postId as string;
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [liking, setLiking] = useState(false);
  const [following, setFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, [postId]);

  const checkAuth = async () => {
    try {
      const session = await authClient.getSession();
      if (!session?.data?.user) {
        router.push("/login");
        return;
      }
      setCurrentUserId(session.data.user.id);
      await fetchPost();
      await fetchComments();
    } catch {
      router.push("/login");
    }
  };

  const fetchPost = async () => {
    try {
      const postIdNum = parseInt(postId, 10);
      if (isNaN(postIdNum)) {
        router.push("/feed");
        return;
      }

      const [postResponse, likesResponse, commentsResponse] = await Promise.all([
        fetch(`/api/posts/${postIdNum}`).then((r) => {
          if (!r.ok) throw new Error("Post not found");
          return r.json();
        }),
        fetch(`/api/posts/${postIdNum}/likes`).then((r) => r.json()),
        fetch(`/api/posts/${postIdNum}/comments`).then((r) => r.json()),
      ]);

      if (!postResponse) {
        router.push("/feed");
        return;
      }

      const postData = {
        ...postResponse,
        likeCount: likesResponse.count || 0,
        userLiked: likesResponse.userLiked || false,
        commentCount: Array.isArray(commentsResponse) ? commentsResponse.length : 0,
      };
      
      setPost(postData);
      
      if (postData.userId !== currentUserId) {
        await checkFollowStatus();
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      router.push("/feed");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const postIdNum = parseInt(postId, 10);
      if (isNaN(postIdNum)) return;

      const response = await fetch(`/api/posts/${postIdNum}/comments`);
      if (response.ok) {
        const commentsData = await response.json();
        setComments(commentsData);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const checkFollowStatus = async () => {
    if (!post?.userId || !currentUserId || post.userId === currentUserId) return;
    
    try {
      const response = await fetch(`/api/follow?userId=${post.userId}`);
      if (response.ok) {
        const data = await response.json();
        setFollowing(data.following);
      }
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  const handleLike = async () => {
    if (!post || liking) return;

    setLiking(true);
    try {
      const response = await fetch(`/api/posts/${post.id}/likes`, {
        method: "POST",
      });

      if (response.ok) {
        await fetchPost();
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setLiking(false);
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim() || !post || postingComment) return;

    setPostingComment(true);
    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentText }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments((prev) => [newComment, ...prev]);
        setCommentText("");
        await fetchPost();
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setPostingComment(false);
    }
  };

  const handleFollow = async () => {
    if (!post || loadingFollow) return;

    setLoadingFollow(true);
    try {
      const response = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: post.userId }),
      });

      if (response.ok) {
        const data = await response.json();
        setFollowing(data.following);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setLoadingFollow(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const isOwnPost = currentUserId === post.userId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800">
      <div className="max-w-4xl mx-auto p-4 lg:p-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <Card className="border-0 shadow-xl backdrop-blur-sm bg-white/80 dark:bg-slate-800/80">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-start gap-4">
              <Link href={`/user/${post.userId}`}>
                {post.userImage ? (
                  <Image
                    src={post.userImage}
                    alt={post.userName}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover cursor-pointer hover:ring-2 ring-blue-500 transition-all"
                    unoptimized
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white font-bold cursor-pointer hover:ring-2 ring-blue-500 transition-all">
                    {post.userName?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <Link href={`/user/${post.userId}`}>
                      <p className="font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                        {post.username || post.userName}
                      </p>
                    </Link>
                    {post.userBio && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {post.userBio}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(post.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  {!isOwnPost && (
                    <Button
                      onClick={handleFollow}
                      disabled={loadingFollow}
                      size="sm"
                      className={`${
                        following
                          ? "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                          : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      }`}
                    >
                      {loadingFollow ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : following ? (
                        <>
                          <UserMinus className="h-4 w-4 mr-2" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {post.imageUrl && (
              <div className="w-full rounded-lg overflow-hidden">
                <Image
                  src={post.imageUrl}
                  alt="Post"
                  width={800}
                  height={600}
                  className="w-full max-h-[600px] object-cover"
                  unoptimized
                />
              </div>
            )}

            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {post.content}
            </p>

            <div className="flex items-center gap-6 text-sm text-muted-foreground pt-3 border-t">
              <button
                onClick={handleLike}
                disabled={liking}
                className={`flex items-center gap-2 hover:text-red-500 transition-colors disabled:opacity-50 ${
                  post.userLiked ? "text-red-500" : ""
                }`}
              >
                {liking ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Heart
                    className={`h-5 w-5 transition-transform hover:scale-110 ${
                      post.userLiked ? "fill-current" : ""
                    }`}
                  />
                )}
                <span className="font-medium">{post.likeCount || 0}</span>
              </button>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 transition-transform hover:scale-110" />
                <span className="font-medium">{post.commentCount || 0}</span>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold">Comments ({comments.length})</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No comments yet. Be the first to comment!
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="flex items-start gap-3 p-3 rounded-lg border"
                    >
                      <Link href={`/user/${comment.userId}`}>
                        {comment.userImage ? (
                          <Image
                            src={comment.userImage}
                            alt={comment.userName}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover cursor-pointer hover:ring-2 ring-blue-500 transition-all"
                            unoptimized
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white font-bold cursor-pointer hover:ring-2 ring-blue-500 transition-all">
                            {comment.userName?.[0]?.toUpperCase() || "U"}
                          </div>
                        )}
                      </Link>
                      <div className="flex-1">
                        <Link href={`/user/${comment.userId}`}>
                          <p className="font-medium text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                            {comment.username || comment.userName}
                          </p>
                        </Link>
                        <p className="text-sm mt-1">{comment.commentText}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handlePostComment();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={handlePostComment}
                  disabled={!commentText.trim() || postingComment}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  {postingComment ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
