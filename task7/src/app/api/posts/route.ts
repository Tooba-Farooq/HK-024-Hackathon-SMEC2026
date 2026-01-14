import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { db } from '@/db';
import { post } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { user as authUser } from '@/db/auth-schema';
import { userProfile } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, imageUrl } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const [newPost] = await db
      .insert(post)
      .values({
        userId: currentUser.id,
        content: content.trim(),
        imageUrl: imageUrl || null,
      })
      .returning();

    return NextResponse.json(newPost);
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
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
    const userId = searchParams.get('userId') || currentUser.id;

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
      })
      .from(post)
      .innerJoin(authUser, eq(post.userId, authUser.id))
      .leftJoin(userProfile, eq(post.userId, userProfile.userId))
      .where(eq(post.userId, userId))
      .orderBy(desc(post.createdAt));

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json(
      { error: 'Failed to get posts' },
      { status: 500 }
    );
  }
}
