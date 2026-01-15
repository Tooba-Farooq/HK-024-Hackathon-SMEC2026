import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { db } from '@/db';
import { post } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { user as authUser } from '@/db/auth-schema';
import { userProfile } from '@/db/schema';

export async function GET(
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
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const postId = parseInt(String(postIdStr), 10);
    if (isNaN(postId) || postId <= 0) {
      return NextResponse.json({ error: `Invalid post ID: ${postIdStr}` }, { status: 400 });
    }

    const [postData] = await db
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
      .where(eq(post.id, postId))
      .limit(1);

    if (!postData) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(postData);
  } catch (error) {
    console.error('Get post error:', error);
    return NextResponse.json(
      { error: 'Failed to get post' },
      { status: 500 }
    );
  }
}
