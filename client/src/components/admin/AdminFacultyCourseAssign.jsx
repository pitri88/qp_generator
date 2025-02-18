import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import Header from '../Header';
import Logo from '../../images/profile.png';
import { theme } from '../../styles/theme';

export default function AdminFacultyCourseAssign() {
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState([]);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [facultyRes, coursesRes, assignmentsRes] = await Promise.all([
        api.get('/faculty/'),
        api.get('/course/'),
        api.get('/faculty-courses/')
      ]);
      if (facultyRes.data.faculty) {
        setFaculty(facultyRes.data.faculty);
      } else {
        setError('No faculty data available');
      }
      if (coursesRes.data.courses) {
        setCourses(coursesRes.data.courses);
      } else {
        setError('No courses data available');
      }
      if (assignmentsRes.data.mappings) {
        setAssignments(assignmentsRes.data.mappings);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.response?.data?.error || 'Failed to load data. Please try again.');
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedFaculty || !selectedCourse) {
      setError('Please select both faculty and course');
      return;
    }

    try {
      await api.post('/faculty-courses/', {
        faculty_id: selectedFaculty,
        course_id: selectedCourse
      });
      fetchData(); // Refresh assignments
      setSelectedFaculty('');
      setSelectedCourse('');
    } catch (error) {
      setError('Failed to assign course');
    }
  };

  const handleUnassign = async (facultyId, courseId) => {
    if (window.confirm('Are you sure you want to remove this assignment?')) {
      try {
        await api.delete('/faculty-courses/', {
          data: {
            faculty_id: facultyId,
            course_id: courseId
          }
        });
        fetchData(); // Refresh assignments
      } catch (error) {
        setError('Failed to remove assignment');
      }
    }
  };

  const getFacultyName = (facultyId) => {
    const facultyMember = faculty.find(f => f.f_id === facultyId);
    return facultyMember ? facultyMember.name : 'Unknown Faculty';
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.course_id === courseId);
    return course ? course.course_name : 'Unknown Course';
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <>
      <Header name="Admin" page="Course Assignments" logo={Logo} />
      <div className="admin-container">
        <div className="assignment-header">
          <h1>Assign Courses to Faculty</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="assignment-form">
          <select
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
          >
            <option value="">Select Faculty</option>
            {faculty.map(f => (
              <option key={f.f_id} value={f.f_id}>
                {f.name}
              </option>
            ))}
          </select>

          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">Select Course</option>
            {courses.map(c => (
              <option key={c.course_id} value={c.course_id}>
                {c.course_name}
              </option>
            ))}
          </select>

          <button className="assign-button" onClick={handleAssign}>
            Assign Course
          </button>
        </div>

        <div className="assignments-list">
          <h2>Current Assignments</h2>
          <table>
            <thead>
              <tr>
                <th>Faculty</th>
                <th>Course</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => (
                <tr key={`${assignment.faculty_id}-${assignment.course_id}`}>
                  <td>{getFacultyName(assignment.faculty_id)}</td>
                  <td>{getCourseName(assignment.course_id)}</td>
                  <td>
                    <button
                      className="unassign-button"
                      onClick={() => handleUnassign(assignment.faculty_id, assignment.course_id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .admin-container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .assignment-header {
          margin-bottom: 2rem;
        }

        h1 {
          color: ${theme.colors.text.primary};
          font-size: ${theme.typography.h1.fontSize};
        }

        .error-message {
          background: ${theme.colors.error.light}20;
          color: ${theme.colors.error.main};
          padding: 1rem;
          border-radius: ${theme.borderRadius.md};
          margin-bottom: 1rem;
        }

        .assignment-form {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          background: white;
          padding: 1.5rem;
          border-radius: ${theme.borderRadius.lg};
          box-shadow: ${theme.shadows.md};
        }

        select {
          padding: 0.75rem;
          border: 1px solid ${theme.colors.border.main};
          border-radius: ${theme.borderRadius.md};
          min-width: 200px;
        }

        .assign-button {
          padding: 0.75rem 1.5rem;
          background: ${theme.colors.primary.main};
          color: white;
          border: none;
          border-radius: ${theme.borderRadius.md};
          cursor: pointer;
          font-weight: 500;
        }

        .assign-button:hover {
          background: ${theme.colors.primary.dark};
        }

        .assignments-list {
          background: white;
          padding: 1.5rem;
          border-radius: ${theme.borderRadius.lg};
          box-shadow: ${theme.shadows.md};
        }

        h2 {
          color: ${theme.colors.text.primary};
          margin-bottom: 1.5rem;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid ${theme.colors.border.light};
        }

        th {
          background: ${theme.colors.background.dark};
          color: white;
          font-weight: 600;
        }

        .unassign-button {
          padding: 0.5rem 1rem;
          background: ${theme.colors.error.main};
          color: white;
          border: none;
          border-radius: ${theme.borderRadius.md};
          cursor: pointer;
        }

        .unassign-button:hover {
          background: ${theme.colors.error.dark};
        }
      `}</style>
    </>
  );
} 