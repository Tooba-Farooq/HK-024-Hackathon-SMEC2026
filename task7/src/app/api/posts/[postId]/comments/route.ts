import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { db } from '@/db';
import { comment } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { user as authUser } from '@/db/auth-schema';
import { userProfile } from '@/db/schema';

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

    const comments = await db
      .select({
        id: comment.id,
        commentText: comment.commentText,
        createdAt: comment.createdAt,
        userId: comment.userId,
        userName: authUser.name,
        userImage: authUser.image,
        username: userProfile.username,
      })
      .from(comment)
      .innerJoin(authUser, eq(comment.userId, authUser.id))
      .leftJoin(userProfile, eq(comment.userId, userProfile.userId))
      .where(eq(comment.postId, postId))
      .orderBy(desc(comment.createdAt));

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { error: 'Failed to get comments' },
      { status: 500 }
    );
  }
}

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

    const body = await request.json();
    const { commentText } = body;

    if (!commentText || !commentText.trim()) {
      return NextResponse.json(
        { error: 'Comment text is required' },
        { status: 400 }
      );
    }

    const [newComment] = await db
      .insert(comment)
      .values({
        postId,
        userId: currentUser.id,
        commentText: commentText.trim(),
      })
      .returning();

    const commentWithUser = await db
      .select({
        id: comment.id,
        commentText: comment.commentText,
        createdAt: comment.createdAt,
        userId: comment.userId,
        userName: authUser.name,
        userImage: authUser.image,
        username: userProfile.username,
      })
      .from(comment)
      .innerJoin(authUser, eq(comment.userId, authUser.id))
      .leftJoin(userProfile, eq(comment.userId, userProfile.userId))
      .where(eq(comment.id, newComment.id))
      .limit(1);

    return NextResponse.json(commentWithUser[0]);
  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
