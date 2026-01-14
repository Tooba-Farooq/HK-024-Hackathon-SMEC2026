"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  Camera,
  Edit2,
  LogOut,
  Save,
  Image as ImageIcon,
  Heart,
  MessageCircle,
  X,
  Home,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

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
  userId: string;
  userName: string;
  userImage: string | null;
  username: string | null;
  likeCount?: number;
  userLiked?: boolean;
  commentCount?: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followers, setFollowers] = useState<Array<{ id: string; name: string; image: string | null; username: string | null; bio: string | null }>>([]);
  const [following, setFollowing] = useState<Array<{ id: string; name: string; image: string | null; username: string | null; bio: string | null }>>([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [creatingPost, setCreatingPost] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState<string | null>(null);
  const [uploadingPostImage, setUploadingPostImage] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    image: null as string | null,
  });

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
      await Promise.all([fetchProfile(), fetchPosts(), fetchFollowers(), fetchFollowing()]);
    } catch {
      router.push("/login");
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({
          username: data.username || "",
          bio: data.bio || "",
          image: data.image,
        });
      } else if (response.status === 404) {
        setIsEditing(true);
        const session = await authClient.getSession();
        if (session?.data?.user) {
          const user = session.data.user;
          setFormData((prev) => ({
            ...prev,
            username: user.name?.toLowerCase().replace(/\s+/g, "") || "",
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts");
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
              likeCount = likesData.count || 0;
              userLiked = likesData.userLiked || false;
            }

            if (commentsResponse.ok) {
              const commentsData = await commentsResponse.json();
              commentCount = Array.isArray(commentsData) ? commentsData.length : 0;
            }

            return { ...post, likeCount, userLiked, commentCount };
          })
        );
        setPosts(postsWithInteractions);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setFormData((prev) => ({ ...prev, image: data.url }));
      setSuccess("Image uploaded successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handlePostImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setUploadingPostImage(true);
    setError("");

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setPostImage(data.url);
      setSuccess("Image uploaded successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to upload image");
    } finally {
      setUploadingPostImage(false);
    }
  };

  const handleSave = async () => {
    if (!formData.username.trim()) {
      setError("Username is required");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save");
      }

      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      await fetchProfile();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim() && !postImage) {
      setError("Post must have content or image");
      return;
    }

    setCreatingPost(true);
    setError("");

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: postContent.trim(),
          imageUrl: postImage,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create post");
      }

      setPostContent("");
      setPostImage(null);
      setSuccess("Post created successfully!");
      await fetchPosts();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create post");
    } finally {
      setCreatingPost(false);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      const response = await fetch(`/api/posts/${postId}/likes`, {
        method: "POST",
      });

      if (response.ok) {
        await fetchPosts();
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const fetchFollowers = async () => {
    setLoadingLists(true);
    try {
      const response = await fetch("/api/profile/followers?type=followers");
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
      const response = await fetch("/api/profile/followers?type=following");
      if (response.ok) {
        const data = await response.json();
        setFollowing(data);
      }
    } catch (error) {
      console.error("Error fetching following:", error);
    } finally {
      setLoadingLists(false);
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
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {profile?.username || "Profile"}
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/feed")}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Feed
            </Button>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {success && (
          <div className="text-sm text-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            {success}
          </div>
        )}

        <Card className="border-0 shadow-xl backdrop-blur-xl bg-white/80 dark:bg-slate-800/80">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="relative">
                  {formData.image ? (
                    <Image
                      src={formData.image}
                      alt="Profile"
                      width={128}
                      height={128}
                      className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-blue-200 dark:border-blue-800"
                      unoptimized
                    />
                  ) : (
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white text-3xl md:text-4xl font-bold">
                      {profile?.name?.[0]?.toUpperCase() || formData.username?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                      <Camera className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">{profile?.username || formData.username || "Username"}</h2>
                    {isEditing ? (
                      <div className="space-y-2 mt-2">
                        <Input
                          value={formData.username}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, username: e.target.value }))
                          }
                          placeholder="Username"
                          className="h-9"
                        />
                        <textarea
                          value={formData.bio}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, bio: e.target.value }))
                          }
                          placeholder="Bio"
                          className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm"
                        />
                      </div>
                    ) : (
                      <p className="text-muted-foreground mt-1">{profile?.bio || "No bio yet"}</p>
                    )}
                  </div>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setIsEditing(false);
                        fetchProfile();
                      }}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Edit2 className="h-4 w-4" />
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
                    <span className="font-semibold">{following.length}</span>
                    <span className="text-muted-foreground">following</span>
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl backdrop-blur-xl bg-white/80 dark:bg-slate-800/80">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">Create Post</h3>
            <div className="space-y-4">
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full min-h-[100px] px-4 py-3 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {postImage && (
                <div className="relative">
                  <Image
                    src={postImage}
                    alt="Post"
                    width={800}
                    height={600}
                    className="w-full max-h-96 object-cover rounded-lg"
                    unoptimized
                  />
                  <button
                    onClick={() => setPostImage(null)}
                    className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                  <ImageIcon className="h-4 w-4" />
                  {uploadingPostImage ? "Uploading..." : "Add Image"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePostImageUpload}
                    className="hidden"
                    disabled={uploadingPostImage}
                  />
                </label>
                <Button
                  onClick={handleCreatePost}
                  disabled={creatingPost || (!postContent.trim() && !postImage)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {creatingPost ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    "Post"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Posts</h3>
          {posts.length === 0 ? (
            <Card className="border-0 shadow-xl backdrop-blur-xl bg-white/80 dark:bg-slate-800/80">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No posts yet. Create your first post!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post) => (
                <Card
                  key={post.id}
                  className="border-0 shadow-lg backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => router.push(`/post/${post.id}`)}
                >
                  {post.imageUrl && (
                    <div className="aspect-square overflow-hidden">
                      <Image
                        src={post.imageUrl}
                        alt="Post"
                        width={800}
                        height={600}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <CardContent className="p-4 space-y-3">
                    <p className="text-sm line-clamp-3">{post.content}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(post.id);
                        }}
                        className={`flex items-center gap-1 hover:text-red-500 transition-colors ${
                          post.userLiked ? "text-red-500" : ""
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${post.userLiked ? "fill-current" : ""}`} />
                        {post.likeCount || 0}
                      </button>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {post.commentCount || 0}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
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
            <DialogDescription>People who follow you ({followers.length})</DialogDescription>
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
                <div key={follower.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  {follower.image ? (
                    <Image
                      src={follower.image}
                      alt={follower.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                      unoptimized
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
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showFollowing} onOpenChange={setShowFollowing}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Following</DialogTitle>
            <DialogDescription>People you follow ({following.length})</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {loadingLists ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : following.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Not following anyone yet</p>
            ) : (
              following.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                      unoptimized
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
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
