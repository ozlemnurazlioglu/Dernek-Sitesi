CREATE TABLE `activity_reports` (
	`id` varchar(64) NOT NULL,
	`year` varchar(16) NOT NULL,
	`pdf_url` varchar(512) NOT NULL,
	`sort` int NOT NULL DEFAULT 0,
	CONSTRAINT `activity_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `board_members` (
	`id` varchar(64) NOT NULL,
	`name` varchar(191) NOT NULL,
	`role` varchar(191) NOT NULL,
	`avatar` varchar(512) NOT NULL,
	`bio` text NOT NULL,
	`sort` int NOT NULL DEFAULT 0,
	CONSTRAINT `board_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `donation_presets` (
	`id` varchar(64) NOT NULL,
	`amount` int NOT NULL,
	`sort` int NOT NULL DEFAULT 0,
	CONSTRAINT `donation_presets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `donation_uses` (
	`id` varchar(64) NOT NULL,
	`text` varchar(255) NOT NULL,
	`sort` int NOT NULL DEFAULT 0,
	CONSTRAINT `donation_uses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `faqs` (
	`id` varchar(64) NOT NULL,
	`question` varchar(512) NOT NULL,
	`answer` text NOT NULL,
	`sort` int NOT NULL DEFAULT 0,
	CONSTRAINT `faqs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `milestones` (
	`id` varchar(64) NOT NULL,
	`year` varchar(16) NOT NULL,
	`text` text NOT NULL,
	`sort` int NOT NULL DEFAULT 0,
	CONSTRAINT `milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `page_blocks` (
	`block_key` varchar(100) NOT NULL,
	`data` json NOT NULL,
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `page_blocks_block_key` PRIMARY KEY(`block_key`)
);
--> statement-breakpoint
CREATE TABLE `required_documents` (
	`id` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`icon` varchar(16) NOT NULL DEFAULT '📄',
	`sort` int NOT NULL DEFAULT 0,
	CONSTRAINT `required_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scholarship_programs` (
	`id` varchar(64) NOT NULL,
	`title` varchar(191) NOT NULL,
	`monthly` varchar(64) NOT NULL,
	`duration` varchar(100) NOT NULL,
	`targets` varchar(191) NOT NULL,
	`quota` int NOT NULL DEFAULT 0,
	`requirements` json NOT NULL,
	`sort` int NOT NULL DEFAULT 0,
	CONSTRAINT `scholarship_programs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scholarship_timeline` (
	`id` varchar(64) NOT NULL,
	`date_label` varchar(100) NOT NULL,
	`title` varchar(191) NOT NULL,
	`description` varchar(255) NOT NULL,
	`sort` int NOT NULL DEFAULT 0,
	CONSTRAINT `scholarship_timeline_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` varchar(16) NOT NULL DEFAULT 'main',
	`name` varchar(191) NOT NULL,
	`short_name` varchar(100) NOT NULL,
	`founded` int NOT NULL,
	`slogan` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`contact_address` text NOT NULL,
	`contact_phone` varchar(64) NOT NULL,
	`contact_email` varchar(191) NOT NULL,
	`contact_working_hours` varchar(191) NOT NULL,
	`map_embed_url` text NOT NULL,
	`bank_name` varchar(191) NOT NULL,
	`bank_account_holder` varchar(191) NOT NULL,
	`bank_iban` varchar(64) NOT NULL,
	`bank_branch` varchar(191) NOT NULL,
	`social_instagram` varchar(512) NOT NULL DEFAULT '',
	`social_twitter` varchar(512) NOT NULL DEFAULT '',
	`social_linkedin` varchar(512) NOT NULL DEFAULT '',
	`social_youtube` varchar(512) NOT NULL DEFAULT '',
	`stat_years_active` int NOT NULL DEFAULT 0,
	`stat_scholarships_given` int NOT NULL DEFAULT 0,
	`stat_active_members` int NOT NULL DEFAULT 0,
	`stat_completed_projects` int NOT NULL DEFAULT 0,
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `site_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` varchar(64) NOT NULL,
	`name` varchar(191) NOT NULL,
	`role` varchar(191) NOT NULL,
	`avatar` varchar(512) NOT NULL,
	`text` text NOT NULL,
	`sort` int NOT NULL DEFAULT 0,
	CONSTRAINT `testimonials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `reports_sort_idx` ON `activity_reports` (`sort`);--> statement-breakpoint
CREATE INDEX `board_sort_idx` ON `board_members` (`sort`);--> statement-breakpoint
CREATE INDEX `presets_sort_idx` ON `donation_presets` (`sort`);--> statement-breakpoint
CREATE INDEX `uses_sort_idx` ON `donation_uses` (`sort`);--> statement-breakpoint
CREATE INDEX `faqs_sort_idx` ON `faqs` (`sort`);--> statement-breakpoint
CREATE INDEX `milestones_sort_idx` ON `milestones` (`sort`);--> statement-breakpoint
CREATE INDEX `docs_sort_idx` ON `required_documents` (`sort`);--> statement-breakpoint
CREATE INDEX `programs_sort_idx` ON `scholarship_programs` (`sort`);--> statement-breakpoint
CREATE INDEX `timeline_sort_idx` ON `scholarship_timeline` (`sort`);--> statement-breakpoint
CREATE INDEX `testimonials_sort_idx` ON `testimonials` (`sort`);