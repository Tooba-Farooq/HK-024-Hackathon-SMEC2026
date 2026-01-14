import { pgTable, text, timestamp, serial, integer, real, index } from 'drizzle-orm/pg-core';
import { user as authUser } from './auth-schema';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => authUser.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['admin', 'passenger', 'driver'] }).notNull().default('passenger'),
  phoneNumber: text('phone_number'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const vehicles = pgTable('vehicles', {
  id: serial('vehicle_id').primaryKey(),
  driverId: integer('driver_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  model: text('model').notNull(),
  numberPlate: text('number_plate').notNull(),
  seatCapacity: integer('seat_capacity').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => [
  index('vehicles_driver_id_idx').on(table.driverId),
]);

export const rides = pgTable('rides', {
  id: serial('ride_id').primaryKey(),
  driverId: integer('driver_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  vehicleId: integer('vehicle_id')
    .references(() => vehicles.id, { onDelete: 'set null' }),
  startLocation: text('start_location').notNull(),
  endLocation: text('end_location').notNull(),
  startLat: real('start_lat'),
  startLng: real('start_lng'),
  endLat: real('end_lat'),
  endLng: real('end_lng'),
  distance: real('distance'),
  departureTime: timestamp('departure_time').notNull(),
  totalSeats: integer('total_seats').notNull(),
  availableSeats: integer('available_seats').notNull(),
  status: text('status', { enum: ['active', 'completed', 'cancelled'] }).notNull().default('active'),
  carbonSavedPerSeat: real('carbon_saved_per_seat').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => [
  index('rides_driver_id_idx').on(table.driverId),
  index('rides_status_idx').on(table.status),
]);

export const bookings = pgTable('bookings', {
  id: serial('booking_id').primaryKey(),
  rideId: integer('ride_id')
    .notNull()
    .references(() => rides.id, { onDelete: 'cascade' }),
  passengerId: integer('passenger_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  seatsBooked: integer('seats_booked').notNull().default(1),
  status: text('status', { enum: ['pending', 'confirmed', 'cancelled'] }).notNull().default('pending'),
  bookingTime: timestamp('booking_time').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => [
  index('bookings_ride_id_idx').on(table.rideId),
  index('bookings_passenger_id_idx').on(table.passengerId),
  index('bookings_status_idx').on(table.status),
]);

export const chats = pgTable('chats', {
  id: serial('chat_id').primaryKey(),
  rideId: integer('ride_id')
    .notNull()
    .references(() => rides.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => [
  index('chats_ride_id_idx').on(table.rideId),
]);

export const messages = pgTable('messages', {
  id: serial('message_id').primaryKey(),
  chatId: integer('chat_id')
    .notNull()
    .references(() => chats.id, { onDelete: 'cascade' }),
  senderId: integer('sender_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  messageText: text('message_text').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('messages_chat_id_idx').on(table.chatId),
  index('messages_sender_id_idx').on(table.senderId),
]);

export const ratings = pgTable('ratings', {
  id: serial('rating_id').primaryKey(),
  rideId: integer('ride_id')
    .notNull()
    .references(() => rides.id, { onDelete: 'cascade' }),
  ratedBy: integer('rated_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  ratedUser: integer('rated_user')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  stars: integer('stars').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => [
  index('ratings_ride_id_idx').on(table.rideId),
  index('ratings_rated_by_idx').on(table.ratedBy),
  index('ratings_rated_user_idx').on(table.ratedUser),
]);

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  rides: many(rides),
  bookings: many(bookings),
  vehicles: many(vehicles),
  messages: many(messages),
  ratingsGiven: many(ratings, { relationName: 'ratedBy' }),
  ratingsReceived: many(ratings, { relationName: 'ratedUser' }),
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  driver: one(users, {
    fields: [vehicles.driverId],
    references: [users.id],
  }),
  rides: many(rides),
}));

export const ridesRelations = relations(rides, ({ one, many }) => ({
  driver: one(users, {
    fields: [rides.driverId],
    references: [users.id],
  }),
  vehicle: one(vehicles, {
    fields: [rides.vehicleId],
    references: [vehicles.id],
  }),
  bookings: many(bookings),
  chats: many(chats),
  ratings: many(ratings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  ride: one(rides, {
    fields: [bookings.rideId],
    references: [rides.id],
  }),
  passenger: one(users, {
    fields: [bookings.passengerId],
    references: [users.id],
  }),
}));

export const chatsRelations = relations(chats, ({ one, many }) => ({
  ride: one(rides, {
    fields: [chats.rideId],
    references: [rides.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  ride: one(rides, {
    fields: [ratings.rideId],
    references: [rides.id],
  }),
  ratedByUser: one(users, {
    fields: [ratings.ratedBy],
    references: [users.id],
    relationName: 'ratedBy',
  }),
  ratedUser: one(users, {
    fields: [ratings.ratedUser],
    references: [users.id],
    relationName: 'ratedUser',
  }),
}));

