CREATE TABLE `agalar` (
	`id` varchar(64) NOT NULL,
	`year` varchar(16) NOT NULL,
	`name` varchar(191) NOT NULL,
	`photo_url` varchar(512) NOT NULL,
	`caption` varchar(191) NOT NULL DEFAULT '',
	`event_date` varchar(32) NOT NULL DEFAULT '',
	`sort` int NOT NULL DEFAULT 0,
	CONSTRAINT `agalar_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `alumni` (
	`id` varchar(64) NOT NULL,
	`full_name` varchar(191) NOT NULL,
	`national_id` varchar(32) NOT NULL DEFAULT '',
	`email` varchar(191) NOT NULL DEFAULT '',
	`phone` varchar(64) NOT NULL DEFAULT '',
	`school_name` varchar(191) NOT NULL DEFAULT '',
	`department` varchar(191) NOT NULL DEFAULT '',
	`graduation_year` int,
	`parent_name` varchar(191) NOT NULL DEFAULT '',
	`parent_phone` varchar(64) NOT NULL DEFAULT '',
	`parent_relation` varchar(80) NOT NULL DEFAULT '',
	`notes` text,
	`source_application_id` varchar(64),
	`created_at` datetime(3) NOT NULL,
	CONSTRAINT `alumni_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `announcement_categories` (
	`id` varchar(64) NOT NULL,
	`slug` varchar(80) NOT NULL,
	`name` varchar(191) NOT NULL,
	`color` varchar(32) NOT NULL DEFAULT 'slate',
	`sort` int NOT NULL DEFAULT 0,
	CONSTRAINT `announcement_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `announcement_categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `announcements` (
	`id` varchar(64) NOT NULL,
	`category_slug` varchar(80) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` varchar(2000) NOT NULL DEFAULT '',
	`event_date` varchar(64) NOT NULL DEFAULT '',
	`start_time` varchar(5) NOT NULL DEFAULT '',
	`end_time` varchar(5) NOT NULL DEFAULT '',
	`location` varchar(191) NOT NULL DEFAULT '',
	`phone` varchar(64) NOT NULL DEFAULT '',
	`sort` int NOT NULL DEFAULT 0,
	CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bank_accounts` (
	`id` varchar(64) NOT NULL,
	`label` varchar(191) NOT NULL,
	`bank_name` varchar(191) NOT NULL DEFAULT '',
	`bank_branch` varchar(191) NOT NULL DEFAULT '',
	`account_holder` varchar(191) NOT NULL DEFAULT '',
	`iban` varchar(64) NOT NULL DEFAULT '',
	`note` varchar(500) NOT NULL DEFAULT '',
	`sort` int NOT NULL DEFAULT 0,
	CONSTRAINT `bank_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `board_levels` (
	`id` varchar(64) NOT NULL,
	`slug` varchar(32) NOT NULL,
	`name` varchar(100) NOT NULL,
	`size` varchar(4) NOT NULL DEFAULT 'md',
	`sort` int NOT NULL DEFAULT 0,
	CONSTRAINT `board_levels_id` PRIMARY KEY(`id`),
	CONSTRAINT `board_levels_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `donors` (
	`id` varchar(64) NOT NULL,
	`name` varchar(191) NOT NULL,
	`donated_at` varchar(32) NOT NULL DEFAULT '',
	`amount` int NOT NULL DEFAULT 0,
	`sort` int NOT NULL DEFAULT 0,
	CONSTRAINT `donors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `event_categories` (
	`id` varchar(64) NOT NULL,
	`name` varchar(80) NOT NULL,
	`sort` int NOT NULL DEFAULT 0,
	CONSTRAINT `event_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `event_categories_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `event_registrations` (
	`id` varchar(64) NOT NULL,
	`event_id` varchar(64) NOT NULL,
	`user_id` varchar(64) NOT NULL,
	`created_at` datetime(3) NOT NULL,
	CONSTRAINT `event_registrations_id` PRIMARY KEY(`id`),
	CONSTRAINT `event_registrations_event_user_uq` UNIQUE(`event_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `finance_items` (
	`id` varchar(64) NOT NULL,
	`year` int NOT NULL,
	`kind` varchar(16) NOT NULL,
	`label` varchar(191) NOT NULL,
	`amount` decimal(14,2) NOT NULL DEFAULT '0',
	`sort` int NOT NULL DEFAULT 0,
	CONSTRAINT `finance_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `legal_pages` (
	`id` varchar(64) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`title` varchar(191) NOT NULL,
	`description` varchar(255) NOT NULL DEFAULT '',
	`content` text NOT NULL,
	`sort` int NOT NULL DEFAULT 0,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `legal_pages_id` PRIMARY KEY(`id`),
	CONSTRAINT `legal_pages_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `neighborhoods` (
	`id` varchar(64) NOT NULL,
	`name` varchar(191) NOT NULL,
	`headman` varchar(191) NOT NULL DEFAULT '',
	`phone` varchar(64) NOT NULL DEFAULT '',
	`sort` int NOT NULL DEFAULT 0,
	CONSTRAINT `neighborhoods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `news_categories` (
	`id` varchar(64) NOT NULL,
	`name` varchar(80) NOT NULL,
	`sort` int NOT NULL DEFAULT 0,
	CONSTRAINT `news_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `news_categories_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `notification_settings` (
	`id` varchar(16) NOT NULL DEFAULT 'main',
	`email_enabled` boolean NOT NULL DEFAULT false,
	`smtp_host` varchar(191) NOT NULL DEFAULT '',
	`smtp_port` int NOT NULL DEFAULT 587,
	`smtp_secure` boolean NOT NULL DEFAULT false,
	`smtp_user` varchar(191) NOT NULL DEFAULT '',
	`smtp_pass` varchar(191) NOT NULL DEFAULT '',
	`smtp_from` varchar(191) NOT NULL DEFAULT '',
	`sms_enabled` boolean NOT NULL DEFAULT false,
	`sms_provider` varchar(32) NOT NULL DEFAULT '',
	`sms_user` varchar(191) NOT NULL DEFAULT '',
	`sms_pass` varchar(191) NOT NULL DEFAULT '',
	`sms_header` varchar(32) NOT NULL DEFAULT '',
	`sms_api_key` varchar(255) NOT NULL DEFAULT '',
	`sms_api_secret` varchar(255) NOT NULL DEFAULT '',
	`sms_from_number` varchar(32) NOT NULL DEFAULT '',
	`templates` json,
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `notification_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `photo_categories` (
	`id` varchar(64) NOT NULL,
	`slug` varchar(80) NOT NULL,
	`name` varchar(191) NOT NULL,
	`description` varchar(500) NOT NULL DEFAULT '',
	`cover_url` varchar(512) NOT NULL DEFAULT '',
	`sort` int NOT NULL DEFAULT 0,
	CONSTRAINT `photo_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `photo_categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `photos` (
	`id` varchar(64) NOT NULL,
	`category_slug` varchar(80) NOT NULL,
	`title` varchar(255) NOT NULL DEFAULT '',
	`image_url` varchar(512) NOT NULL,
	`sort` int NOT NULL DEFAULT 0,
	CONSTRAINT `photos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `protocol_levels` (
	`id` varchar(64) NOT NULL,
	`slug` varchar(32) NOT NULL,
	`name` varchar(100) NOT NULL,
	`size` varchar(4) NOT NULL DEFAULT 'md',
	`sort` int NOT NULL DEFAULT 0,
	CONSTRAINT `protocol_levels_id` PRIMARY KEY(`id`),
	CONSTRAINT `protocol_levels_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `protocol_members` (
	`id` varchar(64) NOT NULL,
	`name` varchar(191) NOT NULL,
	`role` varchar(191) NOT NULL,
	`avatar` varchar(512) NOT NULL,
	`bio` varchar(2000) NOT NULL DEFAULT '',
	`level` varchar(32) NOT NULL DEFAULT 'uye',
	`shape` varchar(16) NOT NULL DEFAULT 'circle',
	`twitter` varchar(512) NOT NULL DEFAULT '',
	`instagram` varchar(512) NOT NULL DEFAULT '',
	`facebook` varchar(512) NOT NULL DEFAULT '',
	`website` varchar(512) NOT NULL DEFAULT '',
	`sort` int NOT NULL DEFAULT 0,
	CONSTRAINT `protocol_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sms_subscribers` (
	`id` varchar(64) NOT NULL,
	`phone` varchar(16) NOT NULL,
	`consent_at` datetime(3) NOT NULL,
	`created_at` datetime(3) NOT NULL,
	`ip` varchar(64) NOT NULL DEFAULT '',
	`user_agent` varchar(255) NOT NULL DEFAULT '',
	CONSTRAINT `sms_subscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `sms_subscribers_phone_uq` UNIQUE(`phone`)
);
--> statement-breakpoint
CREATE TABLE `sponsor_tiers` (
	`id` varchar(64) NOT NULL,
	`slug` varchar(80) NOT NULL,
	`name` varchar(191) NOT NULL,
	`color` varchar(32) NOT NULL DEFAULT 'slate',
	`sort` int NOT NULL DEFAULT 0,
	CONSTRAINT `sponsor_tiers_id` PRIMARY KEY(`id`),
	CONSTRAINT `sponsor_tiers_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `sponsors` (
	`id` varchar(64) NOT NULL,
	`name` varchar(191) NOT NULL,
	`logo_url` varchar(512) NOT NULL DEFAULT '',
	`website_url` varchar(512) NOT NULL DEFAULT '',
	`tier_slug` varchar(80) NOT NULL DEFAULT '',
	`sort` int NOT NULL DEFAULT 0,
	CONSTRAINT `sponsors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `video_categories` (
	`id` varchar(64) NOT NULL,
	`slug` varchar(80) NOT NULL,
	`name` varchar(191) NOT NULL,
	`description` varchar(500) NOT NULL DEFAULT '',
	`cover_url` varchar(512) NOT NULL DEFAULT '',
	`sort` int NOT NULL DEFAULT 0,
	CONSTRAINT `video_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `video_categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `videos` (
	`id` varchar(64) NOT NULL,
	`category_slug` varchar(80) NOT NULL,
	`title` varchar(255) NOT NULL DEFAULT '',
	`description` varchar(1000) NOT NULL DEFAULT '',
	`video_url` varchar(512) NOT NULL,
	`poster_url` varchar(512) NOT NULL DEFAULT '',
	`sort` int NOT NULL DEFAULT 0,
	CONSTRAINT `videos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `activity_reports` MODIFY COLUMN `year` varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE `application_documents` MODIFY COLUMN `doc_key` varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE `applications` MODIFY COLUMN `status` enum('submitted','in_review','approved','rejected','needs_update') NOT NULL DEFAULT 'submitted';--> statement-breakpoint
ALTER TABLE `board_members` MODIFY COLUMN `bio` varchar(2000) NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE `events` MODIFY COLUMN `category` varchar(80) NOT NULL DEFAULT 'Eğitim';--> statement-breakpoint
ALTER TABLE `news` MODIFY COLUMN `category` varchar(80) NOT NULL DEFAULT 'Haber';--> statement-breakpoint
ALTER TABLE `activity_reports` ADD `label` varchar(128) DEFAULT 'Faaliyet Raporu' NOT NULL;--> statement-breakpoint
ALTER TABLE `application_documents` ADD `file_url` varchar(512) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `applications` ADD `neighborhood` varchar(191);--> statement-breakpoint
ALTER TABLE `applications` ADD `failed_courses` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `applications` ADD `expected_grad_year` int;--> statement-breakpoint
ALTER TABLE `applications` ADD `reference_name` varchar(191) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `applications` ADD `reference_phone` varchar(64) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `applications` ADD `reference_relation` varchar(80) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `applications` ADD `parent_reference_name` varchar(191) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `applications` ADD `parent_reference_phone` varchar(64) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `applications` ADD `kvkk_consent_at` datetime(3);--> statement-breakpoint
ALTER TABLE `applications` ADD `auto_rejected_reason` varchar(255) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `applications` ADD `update_request` text;--> statement-breakpoint
ALTER TABLE `board_members` ADD `level` varchar(32) DEFAULT 'uye' NOT NULL;--> statement-breakpoint
ALTER TABLE `board_members` ADD `shape` varchar(16) DEFAULT 'circle' NOT NULL;--> statement-breakpoint
ALTER TABLE `board_members` ADD `twitter` varchar(512) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `board_members` ADD `instagram` varchar(512) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `board_members` ADD `facebook` varchar(512) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `board_members` ADD `website` varchar(512) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `news` ADD `images` json;--> statement-breakpoint
ALTER TABLE `required_documents` ADD `doc_key` varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE `required_documents` ADD `description` varchar(255) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `required_documents` ADD `required` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `logo_url` varchar(512) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `logo_subtitle` varchar(191) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `social_facebook` varchar(512) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `seo_title` varchar(191) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `seo_title_template` varchar(191) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `seo_description` text NOT NULL;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `seo_og_image` varchar(512) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `seo_favicon_url` varchar(512) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `ga_measurement_id` varchar(64) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `gtm_container_id` varchar(64) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `meta_pixel_id` varchar(64) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `adsense_publisher_id` varchar(64) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `custom_tracking_html` text NOT NULL;--> statement-breakpoint
ALTER TABLE `required_documents` ADD CONSTRAINT `required_documents_doc_key_unique` UNIQUE(`doc_key`);--> statement-breakpoint
CREATE INDEX `agalar_sort_idx` ON `agalar` (`sort`);--> statement-breakpoint
CREATE INDEX `alumni_full_name_idx` ON `alumni` (`full_name`);--> statement-breakpoint
CREATE INDEX `alumni_national_id_idx` ON `alumni` (`national_id`);--> statement-breakpoint
CREATE INDEX `alumni_school_idx` ON `alumni` (`school_name`);--> statement-breakpoint
CREATE INDEX `announcement_cats_sort_idx` ON `announcement_categories` (`sort`);--> statement-breakpoint
CREATE INDEX `announcements_cat_idx` ON `announcements` (`category_slug`);--> statement-breakpoint
CREATE INDEX `announcements_sort_idx` ON `announcements` (`sort`);--> statement-breakpoint
CREATE INDEX `bank_accounts_sort_idx` ON `bank_accounts` (`sort`);--> statement-breakpoint
CREATE INDEX `board_levels_sort_idx` ON `board_levels` (`sort`);--> statement-breakpoint
CREATE INDEX `donors_sort_idx` ON `donors` (`sort`);--> statement-breakpoint
CREATE INDEX `event_categories_sort_idx` ON `event_categories` (`sort`);--> statement-breakpoint
CREATE INDEX `event_registrations_event_idx` ON `event_registrations` (`event_id`);--> statement-breakpoint
CREATE INDEX `event_registrations_user_idx` ON `event_registrations` (`user_id`);--> statement-breakpoint
CREATE INDEX `finance_year_idx` ON `finance_items` (`year`);--> statement-breakpoint
CREATE INDEX `finance_kind_idx` ON `finance_items` (`kind`);--> statement-breakpoint
CREATE INDEX `legal_pages_slug_idx` ON `legal_pages` (`slug`);--> statement-breakpoint
CREATE INDEX `neighborhoods_sort_idx` ON `neighborhoods` (`sort`);--> statement-breakpoint
CREATE INDEX `news_categories_sort_idx` ON `news_categories` (`sort`);--> statement-breakpoint
CREATE INDEX `photo_cats_sort_idx` ON `photo_categories` (`sort`);--> statement-breakpoint
CREATE INDEX `photos_cat_idx` ON `photos` (`category_slug`);--> statement-breakpoint
CREATE INDEX `photos_sort_idx` ON `photos` (`sort`);--> statement-breakpoint
CREATE INDEX `protocol_levels_sort_idx` ON `protocol_levels` (`sort`);--> statement-breakpoint
CREATE INDEX `protocol_sort_idx` ON `protocol_members` (`sort`);--> statement-breakpoint
CREATE INDEX `protocol_level_idx` ON `protocol_members` (`level`);--> statement-breakpoint
CREATE INDEX `sms_subscribers_created_idx` ON `sms_subscribers` (`created_at`);--> statement-breakpoint
CREATE INDEX `sponsor_tiers_sort_idx` ON `sponsor_tiers` (`sort`);--> statement-breakpoint
CREATE INDEX `sponsors_sort_idx` ON `sponsors` (`sort`);--> statement-breakpoint
CREATE INDEX `sponsors_tier_idx` ON `sponsors` (`tier_slug`);--> statement-breakpoint
CREATE INDEX `video_cats_sort_idx` ON `video_categories` (`sort`);--> statement-breakpoint
CREATE INDEX `videos_cat_idx` ON `videos` (`category_slug`);--> statement-breakpoint
CREATE INDEX `videos_sort_idx` ON `videos` (`sort`);--> statement-breakpoint
CREATE INDEX `applications_national_id_idx` ON `applications` (`national_id`);--> statement-breakpoint
CREATE INDEX `board_level_idx` ON `board_members` (`level`);--> statement-breakpoint
ALTER TABLE `site_settings` DROP COLUMN `bank_name`;--> statement-breakpoint
ALTER TABLE `site_settings` DROP COLUMN `bank_account_holder`;--> statement-breakpoint
ALTER TABLE `site_settings` DROP COLUMN `bank_iban`;--> statement-breakpoint
ALTER TABLE `site_settings` DROP COLUMN `bank_branch`;