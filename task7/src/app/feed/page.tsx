"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  User,
  LogOut,
  Home,
  Code,
  Send,
  UserPlus,
  UserCheck,
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
  isFollowing?: boolean;
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

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  username?: string;
}

export default function FeedPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [error, setError] = useState("");
  const [likingPostId, setLikingPostId] = useState<number | null>(null);
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());
  const [followingLoading, setFollowingLoading] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    try {
      const session = await authClient.getSession();
      if (!session?.data?.user) {
        router.push("/login");
        return;
      }
      setCurrentUser(session.data.user);
      await Promise.all([fetchPosts(), fetchCurrentUserProfile()]);
    } catch {
      router.push("/login");
    }
  };

  const fetchCurrentUserProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const profile = await response.json();
        setCurrentUser((prev) => prev ? { ...prev, username: profile.username } : null);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/feed");
      if (response.ok) {
        const postsData = await response.json();
        const postsWithInteractions = await Promise.all(
          postsData.map(async (post: Post) => {
            const [likesResponse, commentsResponse] = await Promise.all([
              fetch(`/api/posts/${post.id}/likes`),
              fetch(`/api/posts/${post.id}/comments`),
            ]);

            let likeCount = 0;
            let userLiked = false;
            let commentCount = 0;

            if (likesResponse.ok) {
              const likesData = await likesResponse.json();
              likeCount = likesData.count;
              userLiked = likesData.userLiked;
            }

            if (commentsResponse.ok) {
              const commentsData = await commentsResponse.json();
              commentCount = commentsData.length;
            }

            return { 
              ...post, 
              likeCount, 
              userLiked, 
              commentCount,
              isFollowing: post.isFollowing || false
            };
          })
        );
        
        const followingSet = new Set<string>();
        postsWithInteractions.forEach((p) => {
          if (p.isFollowing && p.userId !== currentUser?.id) {
            followingSet.add(p.userId);
          }
        });
        setFollowingUsers(followingSet);
        setPosts(postsWithInteractions);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: number) => {
    if (likingPostId === postId) return;
    
    if (!postId || isNaN(postId) || postId <= 0) {
      console.error("Invalid post ID for like:", postId);
      setError("Invalid post ID");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    setLikingPostId(postId);
    setError("");
    try {
      const url = `/api/posts/${postId}/likes`;
      console.log("Liking post:", url, "Post ID:", postId, "Type:", typeof postId);
      
      const response = await fetch(url, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        console.error("Like failed:", data);
        throw new Error(data.error || "Failed to like post");
      }

      await fetchPosts();
    } catch (error) {
      console.error("Error toggling like:", error);
      setError(error instanceof Error ? error.message : "Failed to like post. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLikingPostId(null);
    }
  };

  const handleShowComments = async (post: Post) => {
    setSelectedPost(post);
    setShowComments(true);
    setLoadingComments(true);
    try {
      const response = await fetch(`/api/posts/${post.id}/comments`);
      if (response.ok) {
        const commentsData = await response.json();
        setComments(commentsData);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim() || !selectedPost) return;

    if (!selectedPost.id || isNaN(selectedPost.id) || selectedPost.id <= 0) {
      console.error("Invalid post ID for comment:", selectedPost.id);
      setError("Invalid post ID");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setPostingComment(true);
    setError("");
    try {
      const url = `/api/posts/${selectedPost.id}/comments`;
      console.log("Posting comment:", url, "Post ID:", selectedPost.id, "Type:", typeof selectedPost.id);
      
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentText }),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error("Comment failed:", data);
        throw new Error(data.error || "Failed to post comment");
      }

      const newComment = await response.json();
      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
      await fetchPosts();
    } catch (error) {
      console.error("Error posting comment:", error);
      setError(error instanceof Error ? error.message : "Failed to post comment. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setPostingComment(false);
    }
  };

  const handleFollow = async (userId: string, postId: number) => {
    if (followingLoading || !currentUser || userId === currentUser.id) return;

    setFollowingLoading(userId);
    try {
      const response = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        const newFollowingSet = new Set(followingUsers);
        
        if (data.following) {
          newFollowingSet.add(userId);
        } else {
          newFollowingSet.delete(userId);
        }
        
        setFollowingUsers(newFollowingSet);
        
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.userId === userId
              ? { ...p, isFollowing: data.following }
              : p
          )
        );
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setFollowingLoading(null);
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800">
      <div className="flex max-w-7xl mx-auto">
        <aside className="hidden lg:block w-64 p-6 border-r border-border/40 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 h-screen overflow-y-auto">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-8">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg">
                <Code className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  TechShare
                </h1>
                <p className="text-xs text-muted-foreground">Knowledge Hub</p>
              </div>
            </div>

            <nav className="space-y-2">
              <Link
                href="/feed"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium transition-colors"
              >
                <Home className="h-5 w-5" />
                Feed
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
              >
                <User className="h-5 w-5" />
                Profile
              </Link>
            </nav>

            {currentUser && (
              <div className="pt-6 border-t border-border/40">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  {currentUser.image ? (
                    <Image
                      src={currentUser.image}
                      alt={currentUser.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white font-bold">
                      {currentUser.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {currentUser.username || currentUser.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {currentUser.email}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="w-full mt-3"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 max-w-2xl mx-auto p-4 lg:p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          <div className="lg:hidden flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg">
                <Code className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  TechShare
                </h1>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/profile")}
              >
                <User className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {posts.length === 0 ? (
            <Card className="border-0 shadow-lg backdrop-blur-sm bg-white/80 dark:bg-slate-800/80">
              <CardContent className="p-12 text-center">
                <Code className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No posts yet. Follow users to see their tech knowledge shared here!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <Card
                  key={post.id}
                  className="border-0 shadow-lg backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 hover:shadow-xl transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4"
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <Link href={`/user/${post.userId}`} onClick={(e) => e.stopPropagation()}>
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
                        <div className="flex items-center gap-2">
                          <Link href={`/user/${post.userId}`} onClick={(e) => e.stopPropagation()}>
                            <p className="font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                              {post.username || post.userName}
                            </p>
                          </Link>
                          {currentUser && post.userId !== currentUser.id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFollow(post.userId, post.id);
                              }}
                              disabled={followingLoading === post.userId}
                              className={`text-xs px-2 py-1 rounded-full transition-all disabled:opacity-50 flex items-center gap-1 ${
                                followingUsers.has(post.userId) || post.isFollowing
                                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                              }`}
                            >
                              {followingLoading === post.userId ? (
                                <>
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  <span>Loading...</span>
                                </>
                              ) : followingUsers.has(post.userId) || post.isFollowing ? (
                                <>
                                  <UserCheck className="h-3 w-3" />
                                  <span>Followed</span>
                                </>
                              ) : (
                                <>
                                  <UserPlus className="h-3 w-3" />
                                  <span>Follow +</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
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
                    </div>

                    <div
                      className="cursor-pointer space-y-4"
                      onClick={() => router.push(`/post/${post.id}`)}
                    >
                      {post.imageUrl && (
                        <div className="w-full rounded-lg overflow-hidden relative">
                          <Image
                            src={post.imageUrl}
                            alt="Post"
                            width={800}
                            height={600}
                            className="w-full max-h-96 object-cover"
                            unoptimized
                          />
                        </div>
                      )}

                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {post.content}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground pt-3 border-t" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(post.id);
                        }}
                        disabled={likingPostId === post.id}
                        className={`flex items-center gap-2 hover:text-red-500 transition-colors disabled:opacity-50 ${
                          post.userLiked ? "text-red-500" : ""
                        }`}
                      >
                        {likingPostId === post.id ? (
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowComments(post);
                        }}
                        className="flex items-center gap-2 hover:text-blue-500 transition-colors"
                      >
                        <MessageCircle className="h-5 w-5 transition-transform hover:scale-110" />
                        <span className="font-medium">{post.commentCount || 0}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/post/${post.id}`);
                        }}
                        className="ml-auto text-xs text-muted-foreground hover:text-blue-500 transition-colors"
                      >
                        View post →
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      <Dialog open={showComments} onOpenChange={setShowComments}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          <div className="flex-1 overflow-y-auto space-y-4 mt-4">
            {loadingComments ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3 p-3 rounded-lg border">
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
          <div className="flex gap-2 pt-4 border-t">
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
