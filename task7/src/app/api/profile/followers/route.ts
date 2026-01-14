import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { db } from '@/db';
import { follow } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { user as authUser } from '@/db/auth-schema';
import { userProfile } from '@/db/schema';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'followers';
    const userId = searchParams.get('userId') || currentUser.id;

    if (type === 'followers') {
      const followers = await db
        .select({
          id: authUser.id,
          name: authUser.name,
          email: authUser.email,
          image: authUser.image,
          username: userProfile.username,
          bio: userProfile.bio,
          createdAt: follow.createdAt,
        })
        .from(follow)
        .innerJoin(authUser, eq(follow.followerId, authUser.id))
        .leftJoin(userProfile, eq(follow.followerId, userProfile.userId))
        .where(eq(follow.followingId, userId));

      return NextResponse.json(followers);
    } else {
      const following = await db
        .select({
          id: authUser.id,
          name: authUser.name,
          email: authUser.email,
          image: authUser.image,
          username: userProfile.username,
          bio: userProfile.bio,
          createdAt: follow.createdAt,
        })
        .from(follow)
        .innerJoin(authUser, eq(follow.followingId, authUser.id))
        .leftJoin(userProfile, eq(follow.followingId, userProfile.userId))
        .where(eq(follow.followerId, userId));

      return NextResponse.json(following);
    }
  } catch (error) {
    console.error('Get followers/following error:', error);
    return NextResponse.json(
      { error: 'Failed to get followers/following' },
      { status: 500 }
    );
  }
}
