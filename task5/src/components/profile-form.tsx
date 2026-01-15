"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ProfileFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

export function ProfileForm({ user: initialUser }: ProfileFormProps) {
  const [user, setUser] = useState(initialUser);
  const [name, setName] = useState(initialUser.name);
  const [image, setImage] = useState(initialUser.image || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please upload an image file" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image size should be less than 5MB" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;

        const response = await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64String }),
        });

        if (!response.ok) {
          throw new Error("Failed to upload image");
        }

        setImage(base64String);
        setUser({ ...user, image: base64String });
        setMessage({ type: "success", text: "Image uploaded successfully" });
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to upload image" });
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      setUser({ ...user, name });
      setMessage({ type: "success", text: "Profile updated successfully" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update profile" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={image || undefined} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h3 className="text-lg font-semibold">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload Image"}
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email} disabled />
          </div>

          {message && (
            <div
              className={`p-3 rounded-md text-sm ${
                message.type === "success"
                  ? "bg-green-500/10 text-green-600 dark:text-green-400"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {message.text}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>
    </Card>
  );
}
