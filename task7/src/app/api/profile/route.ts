import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { db } from '@/db';
import { userProfile } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { user as authUser } from '@/db/auth-schema';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || currentUser.id;

    const [profile] = await db
      .select({
        id: userProfile.id,
        userId: userProfile.userId,
        username: userProfile.username,
        bio: userProfile.bio,
        createdAt: userProfile.createdAt,
        updatedAt: userProfile.updatedAt,
        name: authUser.name,
        email: authUser.email,
        image: authUser.image,
      })
      .from(userProfile)
      .innerJoin(authUser, eq(userProfile.userId, authUser.id))
      .where(eq(userProfile.userId, userId))
      .limit(1);

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Failed to get profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { username, bio, image } = body;

    const [existingProfile] = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.userId, currentUser.id))
      .limit(1);

    if (existingProfile) {
      await db
        .update(userProfile)
        .set({
          username: username || existingProfile.username,
          bio: bio !== undefined ? bio : existingProfile.bio,
          updatedAt: new Date(),
        })
        .where(eq(userProfile.userId, currentUser.id));

      if (image) {
        await db
          .update(authUser)
          .set({ image, updatedAt: new Date() })
          .where(eq(authUser.id, currentUser.id));
      }
    } else {
      if (!username) {
        return NextResponse.json(
          { error: 'Username is required' },
          { status: 400 }
        );
      }

      await db.insert(userProfile).values({
        userId: currentUser.id,
        username,
        bio: bio || null,
      });

      if (image) {
        await db
          .update(authUser)
          .set({ image, updatedAt: new Date() })
          .where(eq(authUser.id, currentUser.id));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update profile error:', error);
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
