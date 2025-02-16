import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import Header from '../Header';
import Logo from '../../images/profile.png';
import { theme } from '../../styles/theme';

export default function AdminDepartmentCourseAssign() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [newCourse, setNewCourse] = useState({
    course_id: '',
    course_name: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [deptsResponse, coursesResponse] = await Promise.all([
        api.get('/department/'),
        api.get('/course/')
      ]);
      console.log('Departments data:', deptsResponse.data);
      console.log('Courses data:', coursesResponse.data);
      
      setDepartments(deptsResponse.data.departments || []);
      setCourses(coursesResponse.data.courses || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/course/', {
        course_id: newCourse.course_id,
        course_name: newCourse.course_name,
        department_id: selectedDepartment || null
      });

      console.log('Course created:', response.data);
      setNewCourse({ course_id: '', course_name: '' });
      setSelectedDepartment('');
      fetchData();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create course');
    }
  };

  const handleUpdateDepartment = async (courseId) => {
    try {
      // Get current course data
      const courseResponse = await api.get(`/course/${courseId}/`);
      const course = courseResponse.data.course;

      // Create a select element with department options
      const deptSelect = document.createElement('select');
      deptSelect.innerHTML = `
        <option value="">Not Assigned</option>
        ${departments.map(dept => `
          <option value="${dept.dept_id}" ${dept.dept_id === course.department_id ? 'selected' : ''}>
            ${dept.dept_name}
          </option>
        `).join('')}
      `;

      // Show department selection dialog
      const result = window.confirm(`Current department: ${course.department_name}\nSelect new department from the list below:\n\n${deptSelect.innerHTML}`);
      
      if (result) {
        const selectedDept = window.prompt('Enter department ID (or leave empty to unassign):', course.department_id || '');
        if (selectedDept !== null) {
          await api.put(`/course/${courseId}/`, {
            department_id: selectedDept || null
          });
          fetchData();
        }
      }
    } catch (error) {
      console.error('Error updating course:', error);
      setError(error.response?.data?.error || 'Failed to update course');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await api.delete(`/course/${courseId}/`);
        fetchData();
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to delete course');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-course-page">
      <Header name="Admin" page="Courses" logo={Logo} />
      <div className="content-container">
        <div className="form-section">
          <h2>Add Course</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleCreateCourse}>
            <div className="form-group">
              <label>Course Code:</label>
              <input
                type="text"
                value={newCourse.course_id}
                onChange={(e) => setNewCourse({
                  ...newCourse,
                  course_id: e.target.value
                })}
                required
              />
            </div>
            <div className="form-group">
              <label>Course Name:</label>
              <input
                type="text"
                value={newCourse.course_name}
                onChange={(e) => setNewCourse({
                  ...newCourse,
                  course_name: e.target.value
                })}
                required
              />
            </div>
            <div className="form-group">
              <label>Department:</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="">Not Assigned</option>
                {departments.map((dept) => (
                  <option key={dept.dept_id} value={dept.dept_id}>
                    {dept.dept_name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="submit-button">Add Course</button>
          </form>
        </div>

        <div className="list-section">
          <h2>Courses</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Department</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.course_id}>
                    <td>{course.course_id}</td>
                    <td>{course.course_name}</td>
                    <td>{course.department_name}</td>
                    <td className="action-buttons">
                      <button 
                        className="edit-button"
                        onClick={() => handleUpdateDepartment(course.course_id)}
                      >
                        Edit
                      </button>
                      <button 
                        className="delete-button"
                        onClick={() => handleDeleteCourse(course.course_id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-course-page {
          min-height: 100vh;
          background-color: #f5f6fa;
        }

        .content-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 2rem;
        }

        .form-section, .list-section {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .form-group {
          margin-bottom: 1rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #2c3e50;
        }

        input, select {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }

        .submit-button {
          background-color: #3498db;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          width: 100%;
          margin-top: 1rem;
        }

        .table-container {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }

        th {
          background-color: #f8f9fa;
          font-weight: 600;
          color: #2c3e50;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .edit-button, .delete-button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .edit-button {
          background-color: #2ecc71;
          color: white;
        }

        .delete-button {
          background-color: #e74c3c;
          color: white;
        }

        .error-message {
          color: #e74c3c;
          margin-bottom: 1rem;
          padding: 0.5rem;
          background-color: #fde2e2;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
} 