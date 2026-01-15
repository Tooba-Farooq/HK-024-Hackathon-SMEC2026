"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  Users,
  UserPlus,
  UserMinus,
  ArrowLeft,
  Code,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

interface ProfileData {
  id: number;
  userId: string;
  username: string;
  bio: string | null;
  name: string;
  email: string;
  image: string | null;
}

interface Post {
  id: number;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  likeCount?: number;
  commentCount?: number;
}

export default function PublicProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [followers, setFollowers] = useState<any[]>([]);
  const [followingList, setFollowingList] = useState<any[]>([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [loadingLists, setLoadingLists] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, [userId]);

  const checkAuth = async () => {
    try {
      const session = await authClient.getSession();
      if (!session?.data?.user) {
        router.push("/login");
        return;
      }
      setCurrentUserId(session.data.user.id);
      await Promise.all([
        fetchProfile(),
        fetchPosts(),
        checkFollowStatus(),
      ]);
    } catch {
      router.push("/login");
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/profile?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        router.push("/feed");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      router.push("/feed");
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/posts?userId=${userId}`);
      if (response.ok) {
        const postsData = await response.json();
        const postsWithInteractions = await Promise.all(
          postsData.map(async (post: Post) => {
            const [likesResponse, commentsResponse] = await Promise.all([
              fetch(`/api/posts/${post.id}/likes`),
              fetch(`/api/posts/${post.id}/comments`),
            ]);

            let likeCount = 0;
            let commentCount = 0;

            if (likesResponse.ok) {
              const likesData = await likesResponse.json();
              likeCount = likesData.count;
            }

            if (commentsResponse.ok) {
              const commentsData = await commentsResponse.json();
              commentCount = commentsData.length;
            }

            return { ...post, likeCount, commentCount };
          })
        );
        setPosts(postsWithInteractions);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const response = await fetch(`/api/follow?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setFollowing(data.following);
      }
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  const handleFollow = async () => {
    setLoadingFollow(true);
    try {
      const response = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        setFollowing(data.following);
        await fetchProfile();
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setLoadingFollow(false);
    }
  };

  const fetchFollowers = async () => {
    setLoadingLists(true);
    try {
      const response = await fetch(`/api/profile/followers?type=followers&userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setFollowers(data);
      }
    } catch (error) {
      console.error("Error fetching followers:", error);
    } finally {
      setLoadingLists(false);
    }
  };

  const fetchFollowing = async () => {
    setLoadingLists(true);
    try {
      const response = await fetch(`/api/profile/followers?type=following&userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setFollowingList(data);
      }
    } catch (error) {
      console.error("Error fetching following:", error);
    } finally {
      setLoadingLists(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const isOwnProfile = currentUserId === userId;

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

        <Card className="border-0 shadow-xl backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 mb-6">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                {profile.image ? (
                  <img
                    src={profile.image}
                    alt={profile.username}
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 dark:border-blue-800"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white text-5xl font-bold">
                    {profile.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold">{profile.username}</h1>
                    <p className="text-muted-foreground mt-1">{profile.name}</p>
                    {profile.bio && (
                      <p className="text-sm mt-3 leading-relaxed">{profile.bio}</p>
                    )}
                  </div>
                  {!isOwnProfile && (
                    <Button
                      onClick={handleFollow}
                      disabled={loadingFollow}
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
                  {isOwnProfile && (
                    <Button
                      onClick={() => router.push("/profile")}
                      variant="outline"
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>

                <div className="flex gap-6 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">{posts.length}</span>
                    <span className="text-muted-foreground">posts</span>
                  </div>
                  <button
                    onClick={() => {
                      setShowFollowers(true);
                      fetchFollowers();
                    }}
                    className="flex items-center gap-1 hover:underline"
                  >
                    <span className="font-semibold">{followers.length}</span>
                    <span className="text-muted-foreground">followers</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowFollowing(true);
                      fetchFollowing();
                    }}
                    className="flex items-center gap-1 hover:underline"
                  >
                    <span className="font-semibold">{followingList.length}</span>
                    <span className="text-muted-foreground">following</span>
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Posts</h2>
          {posts.length === 0 ? (
            <Card className="border-0 shadow-xl backdrop-blur-sm bg-white/80 dark:bg-slate-800/80">
              <CardContent className="p-12 text-center">
                <Code className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No posts yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post) => (
                <Card
                  key={post.id}
                  className="border-0 shadow-lg backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
                  onClick={() => router.push(`/post/${post.id}`)}
                >
                  {post.imageUrl && (
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={post.imageUrl}
                        alt="Post"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-4 space-y-2">
                    <p className="text-sm line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{post.content}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        {post.likeCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {post.commentCount || 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={showFollowers} onOpenChange={setShowFollowers}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Followers</DialogTitle>
            <DialogDescription>People who follow {profile.username} ({followers.length})</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {loadingLists ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : followers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No followers yet</p>
            ) : (
              followers.map((follower) => (
                <Link
                  key={follower.id}
                  href={`/user/${follower.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
                >
                  {follower.image ? (
                    <img
                      src={follower.image}
                      alt={follower.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white font-bold">
                      {follower.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{follower.username || follower.name}</p>
                    {follower.bio && (
                      <p className="text-sm text-muted-foreground">{follower.bio}</p>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showFollowing} onOpenChange={setShowFollowing}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Following</DialogTitle>
            <DialogDescription>People {profile.username} follows ({followingList.length})</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {loadingLists ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : followingList.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Not following anyone yet</p>
            ) : (
              followingList.map((user) => (
                <Link
                  key={user.id}
                  href={`/user/${user.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
                >
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white font-bold">
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{user.username || user.name}</p>
                    {user.bio && (
                      <p className="text-sm text-muted-foreground">{user.bio}</p>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
