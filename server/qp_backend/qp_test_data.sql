-- Insert into Departments Table
INSERT INTO departments (dept_id, dept_name) VALUES
(1, 'Computer Science'),
(2, 'Mechanical Engineering'),
(3, 'Electrical Engineering');

-- Insert into Courses Table
INSERT INTO courses (course_id, course_name, coordinating_department_id) VALUES
('CS234HTA', 'Data Structures', 1),
('CS101INTRO', 'Introduction to Programming', 1),
('EE201BASICS', 'Circuits Basics', 3);

-- Insert into Units Table
INSERT INTO units (unit_id, course_id, unit_name) VALUES
(1, 'CS234HTA', 'Arrays and Linked Lists'),
(2, 'CS234HTA', 'Trees and Graphs'),
(1, 'CS101INTRO', 'Programming Basics');

-- Insert into Faculty Table
INSERT INTO faculty (f_id, name, email, password_hash, role, department_id) VALUES
('FAC001', 'Alice', 'alice@university.edu', 'hashed_password_1', 'faculty', 1),
('FAC002', 'Bob', 'bob@university.edu', 'hashed_password_2', 'admin', 1),
('FAC003', 'Charlie', 'charlie@university.edu', 'hashed_password_3', 'faculty', 3);

-- Insert into Faculty Courses Table
-- Assumes f_id references faculty.f_id and course_id references courses.course_id
INSERT INTO faculty_courses (faculty_id, course_id) VALUES
('FAC001', 'CS234HTA'), -- Alice teaches Data Structures
('FAC001', 'CS101INTRO'), -- Alice also teaches Introduction to Programming
('FAC003', 'EE201BASICS'); -- Charlie teaches Circuits Basics


-- Insert into Questions Table
-- q_id is now auto-generated as a serial value
INSERT INTO questions (unit_id, course_id, text, co, bt, marks, type, difficulty_level, tags) VALUES
(1, 'CS234HTA', 'Explain the difference between arrays and linked lists.', 'CO1', 'BT4', 5, 'Test', 'Medium', '{"tag1": "Data Structures"}'),
(2, 'CS234HTA', 'What is the time complexity of depth-first search in a graph?', 'CO2', 'BT5', 2, 'Quiz', 'Hard', '{"tag1": "Algorithms"}'),
(1, 'CS101INTRO', 'Write a simple Python program to find the factorial of a number.', 'CO1', 'BT3', 5, 'MCQ', 'Easy', '{"tag1": "Programming"}');

-- Insert into Question Media Table
-- qm_id is now auto-generated as a serial value
INSERT INTO question_media (question_id, type, url) VALUES
(1, 'Image', 'http://example.com/media/array_vs_linkedlist.png'),
(2, 'Graph', 'http://example.com/media/dfs_graph.png'),
(3, 'Equation', 'http://example.com/media/factorial_formula.png');
