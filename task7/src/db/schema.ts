import { pgTable, text, timestamp, serial, integer, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user as authUser } from './auth-schema';

export const userProfile = pgTable('user_profile', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => authUser.id, { onDelete: 'cascade' }),
  username: text('username').notNull().unique(),
  bio: text('bio'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => [
  index('user_profile_userId_idx').on(table.userId),
  index('user_profile_username_idx').on(table.username),
]);

export const post = pgTable('post', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => authUser.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('post_userId_idx').on(table.userId),
  index('post_createdAt_idx').on(table.createdAt),
]);

export const comment = pgTable('comment', {
  id: serial('id').primaryKey(),
  postId: integer('post_id')
    .notNull()
    .references(() => post.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => authUser.id, { onDelete: 'cascade' }),
  commentText: text('comment_text').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('comment_postId_idx').on(table.postId),
  index('comment_userId_idx').on(table.userId),
]);

export const like = pgTable('like', {
  id: serial('id').primaryKey(),
  postId: integer('post_id')
    .notNull()
    .references(() => post.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => authUser.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('like_postId_idx').on(table.postId),
  index('like_userId_idx').on(table.userId),
  index('like_postId_userId_idx').on(table.postId, table.userId),
]);

export const follow = pgTable('follow', {
  id: serial('id').primaryKey(),
  followerId: text('follower_id')
    .notNull()
    .references(() => authUser.id, { onDelete: 'cascade' }),
  followingId: text('following_id')
    .notNull()
    .references(() => authUser.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('follow_followerId_idx').on(table.followerId),
  index('follow_followingId_idx').on(table.followingId),
  index('follow_followerId_followingId_idx').on(table.followerId, table.followingId),
]);

export const userProfileRelations = relations(userProfile, ({ one, many }) => ({
  user: one(authUser, {
    fields: [userProfile.userId],
    references: [authUser.id],
  }),
  posts: many(post),
  comments: many(comment),
  likes: many(like),
  followers: many(follow, {
    relationName: 'follower',
  }),
  following: many(follow, {
    relationName: 'following',
  }),
}));

export const postRelations = relations(post, ({ one, many }) => ({
  user: one(authUser, {
    fields: [post.userId],
    references: [authUser.id],
  }),
  comments: many(comment),
  likes: many(like),
}));

export const commentRelations = relations(comment, ({ one }) => ({
  post: one(post, {
    fields: [comment.postId],
    references: [post.id],
  }),
  user: one(authUser, {
    fields: [comment.userId],
    references: [authUser.id],
  }),
}));

export const likeRelations = relations(like, ({ one }) => ({
  post: one(post, {
    fields: [like.postId],
    references: [post.id],
  }),
  user: one(authUser, {
    fields: [like.userId],
    references: [authUser.id],
  }),
}));

export const followRelations = relations(follow, ({ one }) => ({
  follower: one(authUser, {
    fields: [follow.followerId],
    references: [authUser.id],
    relationName: 'follower',
  }),
  following: one(authUser, {
    fields: [follow.followingId],
    references: [authUser.id],
    relationName: 'following',
  }),
}));
