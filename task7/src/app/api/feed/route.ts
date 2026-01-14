import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { db } from '@/db';
import { post, follow } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { user as authUser } from '@/db/auth-schema';
import { userProfile } from '@/db/schema';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const followingUsers = await db
      .select({ followingId: follow.followingId })
      .from(follow)
      .where(eq(follow.followerId, currentUser.id));

    const followingIds = new Set(followingUsers.map((f) => f.followingId));

    const posts = await db
      .select({
        id: post.id,
        content: post.content,
        imageUrl: post.imageUrl,
        createdAt: post.createdAt,
        userId: post.userId,
        userName: authUser.name,
        userImage: authUser.image,
        username: userProfile.username,
        userBio: userProfile.bio,
      })
      .from(post)
      .innerJoin(authUser, eq(post.userId, authUser.id))
      .leftJoin(userProfile, eq(post.userId, userProfile.userId))
      .orderBy(desc(post.createdAt));

    const postsWithFollowStatus = posts.map((p) => ({
      ...p,
      isFollowing: followingIds.has(p.userId),
    }));

    return NextResponse.json(postsWithFollowStatus);
  } catch (error) {
    console.error('Get feed error:', error);
    return NextResponse.json(
      { error: 'Failed to get feed' },
      { status: 500 }
    );
  }
}
