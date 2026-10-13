-- =============================================================
-- Student Data & Placement Analysis System — Schema
-- =============================================================
-- Run this first:  mysql -u root -p < sql/schema.sql
-- Then seed data:  mysql -u root -p < sql/seed.sql
-- Then create login users: cd backend && npm run seed:users
-- =============================================================

CREATE DATABASE IF NOT EXISTS student_placement_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE student_placement_db;

-- -------------------------------------------------------------
-- Students
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Students (
  roll_no      VARCHAR(20)   PRIMARY KEY,
  name         VARCHAR(100)  NOT NULL,
  branch       VARCHAR(10)   NOT NULL,
  cgpa         DECIMAL(4,2)  NOT NULL CHECK (cgpa BETWEEN 0 AND 10),
  backlogs     INT           NOT NULL DEFAULT 0 CHECK (backlogs >= 0),
  contact      VARCHAR(100),
  created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE INDEX idx_students_branch_cgpa ON Students (branch, cgpa);

-- -------------------------------------------------------------
-- Companies
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Companies (
  company_id       INT AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(150) NOT NULL,
  sector           VARCHAR(100),
  package_offered  DECIMAL(6,2),
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- Placement_Drives
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Placement_Drives (
  drive_id      INT AUTO_INCREMENT PRIMARY KEY,
  company_id    INT NOT NULL,
  drive_date    DATE NOT NULL,
  min_cgpa      DECIMAL(4,2) NOT NULL DEFAULT 0,
  max_backlogs  INT NOT NULL DEFAULT 0,
  FOREIGN KEY (company_id) REFERENCES Companies(company_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- A drive can be open to more than one branch, and a branch can appear
-- in more than one drive, so this is modelled as its own join table
-- rather than a comma-separated column on Placement_Drives.
CREATE TABLE IF NOT EXISTS Drive_Eligible_Branches (
  drive_id  INT NOT NULL,
  branch    VARCHAR(10) NOT NULL,
  PRIMARY KEY (drive_id, branch),
  FOREIGN KEY (drive_id) REFERENCES Placement_Drives(drive_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- Placement_Records
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Placement_Records (
  record_id   INT AUTO_INCREMENT PRIMARY KEY,
  roll_no     VARCHAR(20) NOT NULL,
  drive_id    INT NOT NULL,
  status      ENUM('Applied','In Process','Placed','Rejected') NOT NULL DEFAULT 'Applied',
  ctc         DECIMAL(6,2) DEFAULT NULL,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (roll_no)  REFERENCES Students(roll_no)          ON DELETE CASCADE,
  FOREIGN KEY (drive_id) REFERENCES Placement_Drives(drive_id) ON DELETE CASCADE,
  UNIQUE KEY uniq_student_drive (roll_no, drive_id)
) ENGINE=InnoDB;

CREATE INDEX idx_records_drive  ON Placement_Records (drive_id);
CREATE INDEX idx_records_status ON Placement_Records (status);

-- -------------------------------------------------------------
-- Users (authentication)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Users (
  user_id        INT AUTO_INCREMENT PRIMARY KEY,
  username       VARCHAR(50) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  role           ENUM('admin','student') NOT NULL,
  roll_no        VARCHAR(20) DEFAULT NULL,
  FOREIGN KEY (roll_no) REFERENCES Students(roll_no) ON DELETE SET NULL
) ENGINE=InnoDB;
