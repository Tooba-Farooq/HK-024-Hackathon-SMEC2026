import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { db } from '@/db';
import { like } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ postId: string }> | { postId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = context.params instanceof Promise ? await context.params : context.params;
    const postIdStr = params?.postId;
    
    if (!postIdStr) {
      console.error('Post ID is missing from params:', JSON.stringify(params));
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const postId = parseInt(String(postIdStr), 10);
    if (isNaN(postId) || postId <= 0) {
      console.error('Invalid post ID:', postIdStr, 'Type:', typeof postIdStr, 'Parsed:', postId);
      return NextResponse.json({ error: `Invalid post ID: ${postIdStr}` }, { status: 400 });
    }

    const [existingLike] = await db
      .select()
      .from(like)
      .where(
        and(
          eq(like.postId, postId),
          eq(like.userId, currentUser.id)
        )
      )
      .limit(1);

    if (existingLike) {
      await db
        .delete(like)
        .where(
          and(
            eq(like.postId, postId),
            eq(like.userId, currentUser.id)
          )
        );
      return NextResponse.json({ liked: false });
    } else {
      await db.insert(like).values({
        postId,
        userId: currentUser.id,
      });
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error('Toggle like error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ postId: string }> | { postId: string } }
) {
  try {
    const params = context.params instanceof Promise ? await context.params : context.params;
    const postIdStr = params?.postId;
    
    if (!postIdStr) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const postId = parseInt(String(postIdStr), 10);
    if (isNaN(postId) || postId <= 0) {
      return NextResponse.json({ error: `Invalid post ID: ${postIdStr}` }, { status: 400 });
    }

    const likes = await db
      .select()
      .from(like)
      .where(eq(like.postId, postId));

    const currentUser = await getCurrentUser();
    const userLiked = currentUser
      ? likes.some((l) => l.userId === currentUser.id)
      : false;

    return NextResponse.json({
      count: likes.length,
      userLiked,
    });
  } catch (error) {
    console.error('Get likes error:', error);
    return NextResponse.json(
      { error: 'Failed to get likes' },
      { status: 500 }
    );
  }
}
