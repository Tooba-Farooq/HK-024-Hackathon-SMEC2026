import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { db } from '@/db';
import { follow } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (userId === currentUser.id) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      );
    }

    const [existingFollow] = await db
      .select()
      .from(follow)
      .where(
        and(
          eq(follow.followerId, currentUser.id),
          eq(follow.followingId, userId)
        )
      )
      .limit(1);

    if (existingFollow) {
      await db
        .delete(follow)
        .where(
          and(
            eq(follow.followerId, currentUser.id),
            eq(follow.followingId, userId)
          )
        );
      return NextResponse.json({ following: false });
    } else {
      await db.insert(follow).values({
        followerId: currentUser.id,
        followingId: userId,
      });
      return NextResponse.json({ following: true });
    }
  } catch (error: any) {
    console.error('Toggle follow error:', error);
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Already following this user' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to toggle follow' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const [isFollowing] = await db
      .select()
      .from(follow)
      .where(
        and(
          eq(follow.followerId, currentUser.id),
          eq(follow.followingId, userId)
        )
      )
      .limit(1);

    return NextResponse.json({ following: !!isFollowing });
  } catch (error) {
    console.error('Check follow error:', error);
    return NextResponse.json(
      { error: 'Failed to check follow status' },
      { status: 500 }
    );
  }
}
