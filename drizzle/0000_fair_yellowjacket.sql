CREATE TABLE `application_documents` (
	`application_id` varchar(64) NOT NULL,
	`doc_key` enum('id_card','student_certificate','transcript','income_proof','residence','photo') NOT NULL,
	`file_name` varchar(255) NOT NULL,
	`size` int NOT NULL,
	`uploaded_at` datetime(3) NOT NULL,
	CONSTRAINT `application_documents_application_id_doc_key_pk` PRIMARY KEY(`application_id`,`doc_key`)
);
--> statement-breakpoint
CREATE TABLE `applications` (
	`id` varchar(64) NOT NULL,
	`applicant_id` varchar(64) NOT NULL,
	`status` enum('submitted','in_review','approved','rejected') NOT NULL DEFAULT 'submitted',
	`submitted_at` datetime(3) NOT NULL,
	`reviewed_at` datetime(3),
	`reviewer_note` text,
	`score` int,
	`full_name` varchar(191) NOT NULL,
	`national_id` varchar(32) NOT NULL,
	`birth_date` date NOT NULL,
	`gender` enum('kadin','erkek','belirtmek_istemiyorum') NOT NULL DEFAULT 'belirtmek_istemiyorum',
	`email` varchar(191) NOT NULL,
	`phone` varchar(64) NOT NULL,
	`address` text NOT NULL,
	`city` varchar(128) NOT NULL,
	`school_type` enum('lise','onlisans','lisans','yuksek_lisans','doktora') NOT NULL,
	`school_name` varchar(191) NOT NULL,
	`department` varchar(191) NOT NULL,
	`grade` varchar(32) NOT NULL,
	`gpa` varchar(16) NOT NULL,
	`father_name` varchar(191) NOT NULL,
	`father_job` varchar(191) NOT NULL,
	`father_income` varchar(32) NOT NULL,
	`mother_name` varchar(191) NOT NULL,
	`mother_job` varchar(191) NOT NULL,
	`mother_income` varchar(32) NOT NULL,
	`siblings` int NOT NULL DEFAULT 0,
	`working_members` int NOT NULL DEFAULT 0,
	`previous_scholarship` boolean NOT NULL DEFAULT false,
	`previous_scholarship_detail` text,
	`iban` varchar(64) NOT NULL,
	`motivation_letter` text NOT NULL,
	CONSTRAINT `applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` varchar(64) NOT NULL,
	`slug` varchar(191) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`cover` varchar(512) NOT NULL,
	`starts_at` datetime(3) NOT NULL,
	`ends_at` datetime(3) NOT NULL,
	`location` varchar(255) NOT NULL,
	`capacity` int NOT NULL DEFAULT 0,
	`registered` int NOT NULL DEFAULT 0,
	`category` enum('Eğitim','Sosyal','Yardım','Konferans') NOT NULL DEFAULT 'Eğitim',
	CONSTRAINT `events_id` PRIMARY KEY(`id`),
	CONSTRAINT `events_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` varchar(64) NOT NULL,
	`name` varchar(191) NOT NULL,
	`email` varchar(191) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`created_at` datetime(3) NOT NULL,
	`read` boolean NOT NULL DEFAULT false,
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `news` (
	`id` varchar(64) NOT NULL,
	`slug` varchar(191) NOT NULL,
	`title` varchar(255) NOT NULL,
	`excerpt` text NOT NULL,
	`body` text NOT NULL,
	`cover` varchar(512) NOT NULL,
	`category` enum('Duyuru','Haber','Basın','Proje') NOT NULL DEFAULT 'Haber',
	`published_at` datetime(3) NOT NULL,
	`author` varchar(191) NOT NULL,
	CONSTRAINT `news_id` PRIMARY KEY(`id`),
	CONSTRAINT `news_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`token` varchar(128) NOT NULL,
	`user_id` varchar(64) NOT NULL,
	`created_at` datetime(3) NOT NULL,
	`expires_at` datetime(3) NOT NULL,
	CONSTRAINT `sessions_token` PRIMARY KEY(`token`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(64) NOT NULL,
	`full_name` varchar(191) NOT NULL,
	`email` varchar(191) NOT NULL,
	`password_hash` varchar(191) NOT NULL,
	`role` enum('admin','member') NOT NULL DEFAULT 'member',
	`joined_at` datetime(3) NOT NULL,
	`phone` varchar(64),
	`city` varchar(128),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `application_documents` ADD CONSTRAINT `application_documents_application_id_applications_id_fk` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `applications_applicant_idx` ON `applications` (`applicant_id`);--> statement-breakpoint
CREATE INDEX `applications_status_idx` ON `applications` (`status`);--> statement-breakpoint
CREATE INDEX `messages_created_idx` ON `messages` (`created_at`);--> statement-breakpoint
CREATE INDEX `news_slug_idx` ON `news` (`slug`);--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `users_email_idx` ON `users` (`email`);