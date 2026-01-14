CREATE TABLE "bookings" (
	"booking_id" serial PRIMARY KEY NOT NULL,
	"ride_id" integer NOT NULL,
	"passenger_id" integer NOT NULL,
	"seats_booked" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"booking_time" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chats" (
	"chat_id" serial PRIMARY KEY NOT NULL,
	"ride_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"message_id" serial PRIMARY KEY NOT NULL,
	"chat_id" integer NOT NULL,
	"sender_id" integer NOT NULL,
	"message_text" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ratings" (
	"rating_id" serial PRIMARY KEY NOT NULL,
	"ride_id" integer NOT NULL,
	"rated_by" integer NOT NULL,
	"rated_user" integer NOT NULL,
	"stars" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rides" (
	"ride_id" serial PRIMARY KEY NOT NULL,
	"driver_id" integer NOT NULL,
	"vehicle_id" integer,
	"start_location" text NOT NULL,
	"end_location" text NOT NULL,
	"departure_time" timestamp NOT NULL,
	"total_seats" integer NOT NULL,
	"available_seats" integer NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"carbon_saved_per_seat" real DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"vehicle_id" serial PRIMARY KEY NOT NULL,
	"driver_id" integer NOT NULL,
	"model" text NOT NULL,
	"number_plate" text NOT NULL,
	"seat_capacity" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone_number" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_ride_id_rides_ride_id_fk" FOREIGN KEY ("ride_id") REFERENCES "public"."rides"("ride_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_passenger_id_users_id_fk" FOREIGN KEY ("passenger_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_ride_id_rides_ride_id_fk" FOREIGN KEY ("ride_id") REFERENCES "public"."rides"("ride_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_chats_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("chat_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_ride_id_rides_ride_id_fk" FOREIGN KEY ("ride_id") REFERENCES "public"."rides"("ride_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_rated_by_users_id_fk" FOREIGN KEY ("rated_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_rated_user_users_id_fk" FOREIGN KEY ("rated_user") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rides" ADD CONSTRAINT "rides_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rides" ADD CONSTRAINT "rides_vehicle_id_vehicles_vehicle_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("vehicle_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bookings_ride_id_idx" ON "bookings" USING btree ("ride_id");--> statement-breakpoint
CREATE INDEX "bookings_passenger_id_idx" ON "bookings" USING btree ("passenger_id");--> statement-breakpoint
CREATE INDEX "bookings_status_idx" ON "bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "chats_ride_id_idx" ON "chats" USING btree ("ride_id");--> statement-breakpoint
CREATE INDEX "messages_chat_id_idx" ON "messages" USING btree ("chat_id");--> statement-breakpoint
CREATE INDEX "messages_sender_id_idx" ON "messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "ratings_ride_id_idx" ON "ratings" USING btree ("ride_id");--> statement-breakpoint
CREATE INDEX "ratings_rated_by_idx" ON "ratings" USING btree ("rated_by");--> statement-breakpoint
CREATE INDEX "ratings_rated_user_idx" ON "ratings" USING btree ("rated_user");--> statement-breakpoint
CREATE INDEX "rides_driver_id_idx" ON "rides" USING btree ("driver_id");--> statement-breakpoint
CREATE INDEX "rides_status_idx" ON "rides" USING btree ("status");--> statement-breakpoint
CREATE INDEX "vehicles_driver_id_idx" ON "vehicles" USING btree ("driver_id");