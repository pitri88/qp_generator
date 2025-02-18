import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import Header from '../Header';
import Logo from '../../images/profile.png';
import { theme } from '../../styles/theme';

export default function DepartmentCourseAssign() {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, deptsRes] = await Promise.all([
        api.get('/course/'),
        api.get('/department/')
      ]);
      setCourses(coursesRes.data.courses || []);
      setDepartments(deptsRes.data.departments || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
      setLoading(false);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setSelectedDepartment(course.department_id || '');
  };

  const handleUpdate = async (courseId) => {
    try {
      if (!courseId) {
        setError('Course ID is required');
        return;
      }

      const response = await api.put(`/course/${courseId}/`, {
        course_id: courseId,
        department_id: selectedDepartment === '' ? null : selectedDepartment
      });

      if (response.data) {
        setEditingCourse(null);
        setSelectedDepartment('');
        await fetchData();
      }
    } catch (err) {
      console.error('Error updating course:', err);
      setError(err.response?.data?.error || 'Failed to update course');
    }
  };

  const handleCancel = () => {
    setEditingCourse(null);
    setSelectedDepartment('');
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <>
      <Header name="Assign Courses to Departments" logo={Logo} />
      <div className="container">
        <div className="mappings-list">
          {courses.map((course) => (
            <div key={course.course_id} className="mapping-card">
              <div className="course-info">
                <h3>{course.course_name}</h3>
                <p className="course-id">Course ID: {course.course_id}</p>
              </div>
              
              {editingCourse?.course_id === course.course_id ? (
                <div className="edit-form">
                  <div className="select-wrapper">
                    <select 
                      value={selectedDepartment}
                      onChange={(e) => {
                        e.preventDefault();
                        setSelectedDepartment(e.target.value);
                      }}
                      className="department-select"
                    >
                      <option value="">Not Assigned</option>
                      {departments.map((dept) => (
                        <option key={dept.dept_id} value={dept.dept_id}>
                          {dept.dept_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="button-group">
                    <button 
                      type="button"
                      className="save-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        if (course.course_id) {
                          handleUpdate(course.course_id);
                        } else {
                          setError('Course ID is missing');
                        }
                      }}
                    >
                      Save
                    </button>
                    <button 
                      type="button"
                      className="cancel-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        handleCancel();
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="department-info">
                  <p className="department-name">
                    Department: {course.department_name || 'Not Assigned'}
                  </p>
                  <button 
                    type="button"
                    className="edit-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      handleEdit(course);
                    }}
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .mappings-list {
          display: grid;
          gap: 1rem;
        }

        .mapping-card {
          background: white;
          padding: 1.5rem;
          border-radius: ${theme.borderRadius.lg};
          box-shadow: ${theme.shadows.md};
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .course-info h3 {
          margin: 0;
          color: ${theme.colors.text.primary};
        }

        .course-id {
          margin: 0.5rem 0 0;
          color: ${theme.colors.text.secondary};
          font-size: 0.9rem;
        }

        .department-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .department-name {
          margin: 0;
          color: ${theme.colors.text.secondary};
        }

        .edit-form {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .select-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .select-wrapper label {
          font-size: 0.9rem;
          color: ${theme.colors.text.secondary};
        }

        .department-select {
          padding: 0.5rem;
          border-radius: ${theme.borderRadius.md};
          border: 1px solid ${theme.colors.border};
          min-width: 200px;
          font-size: 1rem;
          background-color: white;
        }

        .button-group {
          display: flex;
          gap: 0.5rem;
        }

        .edit-btn, .save-btn, .cancel-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: ${theme.borderRadius.md};
          cursor: pointer;
          font-weight: 500;
          transition: opacity 0.2s;
        }

        .edit-btn {
          background: ${theme.colors.primary.main};
          color: white;
        }

        .save-btn {
          background: ${theme.colors.success.main};
          color: white;
        }

        .cancel-btn {
          background: ${theme.colors.error.main};
          color: white;
        }

        .edit-btn:hover, .save-btn:hover, .cancel-btn:hover {
          opacity: 0.9;
        }
      `}</style>
    </>
  );
} 