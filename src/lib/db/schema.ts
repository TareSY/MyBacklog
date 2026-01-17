import { pgTable, uuid, text, boolean, timestamp, integer, serial, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import type { AdapterAccountType } from 'next-auth/adapters';

// ============================================
// NextAuth.js Required Tables
// ============================================

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  password: text('password'), // For credentials auth
  username: text('username').unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const accounts = pgTable('accounts', {
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').$type<AdapterAccountType>().notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (account) => [
  primaryKey({ columns: [account.provider, account.providerAccountId] }),
]);

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}, (verificationToken) => [
  primaryKey({ columns: [verificationToken.identifier, verificationToken.token] }),
]);

// ============================================
// MyBacklog App Tables
// ============================================

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  icon: text('icon'),
  color: text('color'),
});

export const genres = pgTable('genres', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  categoryId: integer('category_id').references(() => categories.id),
});

export const lists = pgTable('lists', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull().default('My Backlog'),
  description: text('description'),
  isPublic: boolean('is_public').default(false),
  shareSlug: text('share_slug').unique(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const items = pgTable('items', {
  id: uuid('id').primaryKey().defaultRandom(),
  listId: uuid('list_id')
    .notNull()
    .references(() => lists.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id')
    .notNull()
    .references(() => categories.id),
  externalId: text('external_id'),
  externalSource: text('external_source'), // 'tmdb', 'google_books', 'spotify'
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  imageUrl: text('image_url'),
  releaseYear: integer('release_year'),
  description: text('description'),
  isCompleted: boolean('is_completed').default(false),
  completedAt: timestamp('completed_at'),
  addedAt: timestamp('added_at').defaultNow(),
  notes: text('notes'),
  rating: integer('rating'),
});

export const itemGenres = pgTable('item_genres', {
  itemId: uuid('item_id')
    .notNull()
    .references(() => items.id, { onDelete: 'cascade' }),
  genreId: integer('genre_id')
    .notNull()
    .references(() => genres.id),
}, (table) => [
  primaryKey({ columns: [table.itemId, table.genreId] }),
]);

// ============================================
// Social Features - Friendships
// ============================================

export const friendships = pgTable('friendships', {
  id: uuid('id').primaryKey().defaultRandom(),
  requesterId: uuid('requester_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  addresseeId: uuid('addressee_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('pending'), // 'pending', 'accepted', 'rejected'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================
// Activity Feed
// ============================================

export const activities = pgTable('activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  action: text('action').notNull(), // 'added_item', 'completed_item', 'created_list', 'added_friend'
  targetType: text('target_type'), // 'item', 'list', 'user'
  targetId: uuid('target_id'),
  targetTitle: text('target_title'),
  metadata: text('metadata'), // JSON string for extra data
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================
// Relations
// ============================================

export const usersRelations = relations(users, ({ many }) => ({
  lists: many(lists),
  accounts: many(accounts),
  sessions: many(sessions),
  sentFriendRequests: many(friendships, { relationName: 'requester' }),
  receivedFriendRequests: many(friendships, { relationName: 'addressee' }),
}));

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  requester: one(users, {
    fields: [friendships.requesterId],
    references: [users.id],
    relationName: 'requester',
  }),
  addressee: one(users, {
    fields: [friendships.addresseeId],
    references: [users.id],
    relationName: 'addressee',
  }),
}));

export const listsRelations = relations(lists, ({ one, many }) => ({
  user: one(users, {
    fields: [lists.userId],
    references: [users.id],
  }),
  items: many(items),
}));

export const itemsRelations = relations(items, ({ one, many }) => ({
  list: one(lists, {
    fields: [items.listId],
    references: [lists.id],
  }),
  category: one(categories, {
    fields: [items.categoryId],
    references: [categories.id],
  }),
  genres: many(itemGenres),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  genres: many(genres),
  items: many(items),
}));

export const genresRelations = relations(genres, ({ one, many }) => ({
  category: one(categories, {
    fields: [genres.categoryId],
    references: [categories.id],
  }),
  items: many(itemGenres),
}));

export const itemGenresRelations = relations(itemGenres, ({ one }) => ({
  item: one(items, {
    fields: [itemGenres.itemId],
    references: [items.id],
  }),
  genre: one(genres, {
    fields: [itemGenres.genreId],
    references: [genres.id],
  }),
}));
