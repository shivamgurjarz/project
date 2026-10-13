-- =============================================================
-- Sample data — same records the frontend prototype used,
-- so the two line up once the frontend is wired to the API.
-- Run after schema.sql:  mysql -u root -p < sql/seed.sql
-- =============================================================

USE student_placement_db;

INSERT INTO Students (roll_no, name, branch, cgpa, backlogs, contact) VALUES
('2302300100153', 'Shivam Chauhan', 'CSE', 8.40, 0, 'shivam@example.edu'),
('2302300100184', 'Vansh Tomar',    'CSE', 7.90, 0, 'vansh@example.edu'),
('2302300100016', 'Aman Chaudhary', 'CSE', 8.10, 0, 'aman@example.edu'),
('2302300100201', 'Riya Sharma',    'IT',  9.00, 0, 'riya@example.edu'),
('2302300100207', 'Kabir Mehta',    'ECE', 6.80, 1, 'kabir@example.edu'),
('2302300100219', 'Neha Verma',     'CSE', 8.80, 0, 'neha@example.edu'),
('2302300100233', 'Arjun Rao',      'ME',  7.20, 0, 'arjun@example.edu'),
('2302300100240', 'Simran Kaur',    'IT',  8.60, 0, 'simran@example.edu');

INSERT INTO Companies (company_id, name, sector, package_offered) VALUES
(1, 'Northbridge Systems', 'Software',          9.50),
(2, 'Vertex Analytics',    'Data / Analytics', 12.00),
(3, 'Kesari Manufacturing','Core Engineering',  6.50),
(4, 'Lumen Cloud',         'Software',         15.20);

INSERT INTO Placement_Drives (drive_id, company_id, drive_date, min_cgpa, max_backlogs) VALUES
(1, 1, '2026-08-14', 7.00, 0),
(2, 2, '2026-08-22', 8.00, 0),
(3, 3, '2026-09-02', 6.00, 1),
(4, 4, '2026-09-10', 8.50, 0);

INSERT INTO Drive_Eligible_Branches (drive_id, branch) VALUES
(1, 'CSE'), (1, 'IT'),
(2, 'CSE'), (2, 'IT'), (2, 'ECE'),
(3, 'ME'),  (3, 'ECE'),
(4, 'CSE'), (4, 'IT');

INSERT INTO Placement_Records (roll_no, drive_id, status, ctc) VALUES
('2302300100153', 1, 'Placed',     9.50),
('2302300100219', 2, 'Placed',    12.00),
('2302300100201', 4, 'Placed',    15.20),
('2302300100240', 4, 'In Process', NULL),
('2302300100233', 3, 'Placed',     6.50),
('2302300100184', 1, 'In Process', NULL);

-- Note: login users (Users table) are created separately via
-- `npm run seed:users` in /backend, because passwords need to be
-- bcrypt-hashed in JavaScript rather than inserted as plain SQL.
