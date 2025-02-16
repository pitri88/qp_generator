-- Create Departments Table
CREATE TABLE departments (
    dept_id INT PRIMARY KEY,
    dept_name VARCHAR(255) NOT NULL
);

-- Create Courses Table
CREATE TABLE courses (
    course_id VARCHAR(50) PRIMARY KEY,
    course_name VARCHAR(255) NOT NULL,
    coordinating_department_id INT REFERENCES departments(dept_id) ON DELETE CASCADE
);

-- Create Units Table
CREATE TABLE units (
    unit_id INT NOT NULL,
    course_id VARCHAR(50) NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    unit_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (unit_id, course_id)
);

-- Create Faculty Table
CREATE TABLE faculty (
    f_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('admin', 'faculty')) NOT NULL,
    department_id INT REFERENCES departments(dept_id) ON DELETE SET NULL
);

-- Create Faculty-Courses Junction Table
CREATE TABLE faculty_courses (
    faculty_id VARCHAR(50) REFERENCES faculty(f_id) ON DELETE CASCADE,
    course_id VARCHAR(50) REFERENCES courses(course_id) ON DELETE CASCADE,
    PRIMARY KEY (faculty_id, course_id)
);

-- Create Questions Table
CREATE TABLE questions (
    q_id SERIAL PRIMARY KEY, -- Changed to a unique serial primary key
    unit_id INT NOT NULL,
    course_id VARCHAR(50) NOT NULL,
    text TEXT NOT NULL,
    co VARCHAR(50) NOT NULL,
    bt VARCHAR(50) NOT NULL,
    marks INT NOT NULL,
    type VARCHAR(50) CHECK (type IN ('Quiz', 'Test', 'MCQ')) NOT NULL,
    difficulty_level VARCHAR(50) CHECK (difficulty_level IN ('Easy', 'Medium', 'Hard')),
    tags JSONB,
    FOREIGN KEY (unit_id, course_id) REFERENCES units(unit_id, course_id) ON DELETE CASCADE
);

-- Create Question Media Table
CREATE TABLE question_media (
    qm_id SERIAL PRIMARY KEY, -- Added auto-incrementing primary key
    question_id INT NOT NULL REFERENCES questions(q_id) ON DELETE CASCADE, -- Referencing only q_id
    type VARCHAR(50) CHECK (type IN ('Image', 'Graph', 'Table', 'Equation', 'Other')) NOT NULL,
    url TEXT NOT NULL
);

-- Add Indexes for Optimization
-- Index for quick lookup of units by course_id
CREATE INDEX idx_units_course_id ON units(course_id);

-- Index for quick lookup of faculty by department_id
CREATE INDEX idx_faculty_department_id ON faculty(department_id);

-- Index for quick lookup of faculty-course relationships
CREATE INDEX idx_faculty_courses ON faculty_courses(faculty_id, course_id);

-- Index for fetching questions by course_id and unit_id
CREATE INDEX idx_questions_course_unit ON questions(course_id, unit_id);

-- Index for filtering questions by CO and BT
CREATE INDEX idx_questions_co_bt ON questions(co, bt);

-- Index for JSONB tags (used for filtering and searching tags)
CREATE INDEX idx_questions_tags ON questions USING gin(tags);

-- Index for quick lookup of question media by question_id
CREATE INDEX idx_question_media_question_id ON question_media(question_id);
