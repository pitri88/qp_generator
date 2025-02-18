import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import Header from '../Header';
import Logo from '../../images/profile.png';
import { theme } from '../../styles/theme';
import { Button } from '../common/Button';

export default function AdminCourseList() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCourse, setNewCourse] = useState({
    course_id: '',
    course_name: '',
    department_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesResponse, deptsResponse] = await Promise.all([
        api.get('/course/'),
        api.get('/department/')
      ]);
      console.log('Courses:', coursesResponse.data);
      console.log('Departments:', deptsResponse.data);
      setCourses(coursesResponse.data.courses);
      setDepartments(deptsResponse.data.departments);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!newCourse.course_id || !newCourse.course_name) {
        setError('Course ID and Course Name are required');
        return;
      }

      const response = await api.post('/course/', {
        course_id: newCourse.course_id,
        course_name: newCourse.course_name,
        department_id: newCourse.department_id || null
      });

      console.log('Course created:', response.data);
      setNewCourse({ course_id: '', course_name: '', department_id: '' });
      setError(null);
      fetchData();
    } catch (error) {
      console.error('Error creating course:', error);
      setError(error.response?.data?.error || 'Failed to create course');
    }
  };

  const handleEdit = async (courseId) => {
    try {
      // Get current course data
      const courseResponse = await api.get(`/course/${courseId}/`);
      const course = courseResponse.data.course;

      // Create department options string
      const departmentOptions = departments.map(dept => 
        `${dept.dept_id}: ${dept.dept_name}`
      ).join('\n');

      // Show department selection dialog with current department and available options
      const message = `Current department: ${course.department_name}\n\nAvailable departments:\n${departmentOptions}\n\nEnter department ID (or leave empty to unassign):`;
      const selectedDept = window.prompt(message, course.department_id || '');

      if (selectedDept !== null) { // Only proceed if user didn't click Cancel
        await api.put(`/course/${courseId}/`, {
          department_id: selectedDept || null
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error updating course:', error);
      setError(error.response?.data?.error || 'Failed to update course');
    }
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await api.delete(`/course/${courseId}/`);
        fetchData();
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to delete course');
      }
    }
  };

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;
  if (error) return <div className="error-screen">{error}</div>;

  return (
    <>
      <Header name="Courses" logo={Logo} />
      <div className="container">
        <div className="header-section">
          <h1>Manage Courses</h1>
          <Button 
            onClick={() => navigate('/admin/courses/add')}
            variant="primary"
          >
            Add New Course
          </Button>
        </div>

        <div className="card-grid">
          {courses.map((course) => (
            <div key={course.course_id} className="course-card" style={{ '--card-color': theme.colors.primary.main }}>
              <div className="card-header">
                <span className="course-icon">📚</span>
                <h3>{course.course_name}</h3>
                <div className="course-id">{course.course_id}</div>
              </div>
              <div className="card-content">
                <div className="stat-item">
                  <span className="label">Department</span>
                  <span className="value">{course.department_name || 'Not Assigned'}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Questions</span>
                  <span className="value">{course.question_count || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Units</span>
                  <span className="value">{course.unit_count || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Faculty</span>
                  <span className="value">{course.faculty_count || 0}</span>
                </div>
              </div>
              <div className="card-actions">
                <button 
                  className="edit-btn"
                  onClick={() => navigate(`/admin/courses/${course.course_id}/edit`)}
                >
                  Edit
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => handleDelete(course.course_id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .container {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
          min-height: calc(100vh - 64px);
          background: ${theme.colors.background.light};
        }

        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          background: white;
          padding: 1.5rem 2rem;
          border-radius: ${theme.borderRadius.lg};
          box-shadow: ${theme.shadows.md};
        }

        .header-section h1 {
          color: ${theme.colors.primary.main};
          margin: 0;
          font-size: 2rem;
        }

        .card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
        }

        .course-card {
          background: white;
          --card-color: ${theme.colors.primary.main};
          border-top: 4px solid var(--card-color);
          border-radius: ${theme.borderRadius.lg};
          overflow: hidden;
          box-shadow: ${theme.shadows.md};
          transition: all 0.3s ease;
        }

        .course-card:hover {
          transform: translateY(-5px);
          box-shadow: ${theme.shadows.lg};
        }

        .card-header {
          padding: 1.5rem;
          border-bottom: 1px solid ${theme.colors.border.main};
          display: flex;
          align-items: center;
          gap: 1rem;
          color: var(--card-color);
        }

        .course-icon {
          font-size: 1.5rem;
        }

        .card-header h3 {
          margin: 0;
          flex: 1;
          font-size: 1.25rem;
          color: inherit;
          font-weight: 600;
        }

        .course-id {
          color: var(--card-color);
          font-size: 0.875rem;
          padding: 0.25rem 0.75rem;
          background: ${theme.colors.background.light};
          border-radius: ${theme.borderRadius.full};
          font-weight: 500;
        }

        .card-content {
          padding: 1.5rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .stat-item {
          text-align: center;
          padding: 0.5rem;
        }

        .label {
          display: block;
          color: ${theme.colors.text.secondary};
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }

        .value {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--card-color);
        }

        .card-actions {
          padding: 1rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          border-top: 1px solid ${theme.colors.border};
        }

        .edit-btn, .delete-btn {
          padding: 0.75rem;
          border: none;
          border-radius: ${theme.borderRadius.md};
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .edit-btn {
          background: var(--card-color);
          color: white;
        }

        .edit-btn:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }

        .delete-btn {
          background: ${theme.colors.error.light};
          color: ${theme.colors.error.main};
        }

        .delete-btn:hover {
          background: ${theme.colors.error.main};
          color: white;
          transform: translateY(-1px);
        }

        .loading-screen, .error-screen {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: calc(100vh - 64px);
          font-size: 1.2rem;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 5px solid ${theme.colors.background.default};
          border-top: 5px solid ${theme.colors.secondary.main};
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .error-screen {
          color: ${theme.colors.error.main};
          text-align: center;
          padding: 2rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
} 