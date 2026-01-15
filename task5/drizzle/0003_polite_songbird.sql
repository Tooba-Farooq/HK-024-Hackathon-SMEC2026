CREATE TABLE "friendship" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"friend_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_id" text NOT NULL,
	"receiver_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"bio" text,
	"image" text,
	"qr_code" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profile_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "profile_qr_code_unique" UNIQUE("qr_code")
);
--> statement-breakpoint
DROP TABLE "test_table" CASCADE;--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
ALTER TABLE "friendship" ADD CONSTRAINT "friendship_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendship" ADD CONSTRAINT "friendship_friend_id_user_id_fk" FOREIGN KEY ("friend_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_receiver_id_user_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "friendship_userId_idx" ON "friendship" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "friendship_friendId_idx" ON "friendship" USING btree ("friend_id");--> statement-breakpoint
CREATE INDEX "message_senderId_idx" ON "message" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "message_receiverId_idx" ON "message" USING btree ("receiver_id");--> statement-breakpoint
CREATE INDEX "message_createdAt_idx" ON "message" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "profile_userId_idx" ON "profile" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "profile_qrCode_idx" ON "profile" USING btree ("qr_code");