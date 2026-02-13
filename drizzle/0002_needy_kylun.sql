CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '',
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `transactions` ADD `event_id` integer REFERENCES events(id);--> statement-breakpoint
CREATE INDEX `idx_transactions_event_id` ON `transactions` (`event_id`);