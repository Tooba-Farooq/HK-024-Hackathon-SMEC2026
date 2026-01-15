CREATE TABLE "connection" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"connected_user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "connection" ADD CONSTRAINT "connection_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connection" ADD CONSTRAINT "connection_connected_user_id_user_id_fk" FOREIGN KEY ("connected_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "connection_userId_idx" ON "connection" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "connection_connectedUserId_idx" ON "connection" USING btree ("connected_user_id");