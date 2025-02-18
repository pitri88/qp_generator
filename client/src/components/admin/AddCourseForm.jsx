import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../utils/api';
import { theme } from '../../styles/theme';
import { Button } from '../common/Button';

export default function AddCourseForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    dept_id: ''
  });
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
    if (id) {
      fetchCourse();
    }
  }, [id]);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/department/');
      setDepartments(response.data.departments || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError('Failed to load departments');
    }
  };

  const fetchCourse = async () => {
    try {
      const response = await api.get(`/course/`, { params: { course_id: id } });
      const course = response.data.course;
      setFormData({
        course_code: course.course_id,
        course_name: course.course_name,
        dept_id: course.department_id || ''
      });
    } catch (err) {
      console.error('Error fetching course:', err);
      setError('Failed to load course details');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.course_code || !formData.course_name) {
        setError('Course ID and name are required');
        setLoading(false);
        return;
      }

      const requestData = {
        course_id: formData.course_code.toString().trim(),
        course_name: formData.course_name.trim(),
        department_id: formData.dept_id || null
      };

      console.log('Sending course data:', requestData);

      let response;
      if (id) {
        // For editing, include the course_id in the request data
        requestData.course_id = id;
        response = await api.put(`/course/${id}/`, requestData);
      } else {
        response = await api.post('/course/', requestData);
      }

      console.log('Course saved:', response.data);
      navigate('/admin/courses');
    } catch (err) {
      console.error('Error saving course:', err.response?.data || err);
      setError(err.response?.data?.error || 'Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="form-container">
      <h2>{id ? 'Edit Course' : 'Add New Course'}</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="course_code">Course Code *</label>
          <input
            type="text"
            id="course_code"
            name="course_code"
            value={formData.course_code}
            onChange={handleChange}
            required
            placeholder="Enter course code"
            disabled={id} // Disable course code field in edit mode
          />
        </div>

        <div className="form-group">
          <label htmlFor="course_name">Course Name *</label>
          <input
            type="text"
            id="course_name"
            name="course_name"
            value={formData.course_name}
            onChange={handleChange}
            required
            placeholder="Enter course name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="dept_id">Department</label>
          <select
            id="dept_id"
            name="dept_id"
            value={formData.dept_id}
            onChange={handleChange}
          >
            <option value="">Select Department</option>
            {departments.map(dept => (
              <option key={dept.dept_id} value={dept.dept_id}>
                {dept.dept_name}
              </option>
            ))}
          </select>
        </div>

        <div className="button-group">
          <Button 
            type="button" 
            onClick={() => navigate('/admin/courses')} 
            className="btn btn-secondary"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
          >
            {loading ? (id ? 'Updating...' : 'Adding...') : (id ? 'Update Course' : 'Add Course')}
          </Button>
        </div>
      </form>

      <style jsx>{`
        .form-container {
          max-width: 600px;
          margin: 2rem auto;
          padding: 2rem;
          background: white;
          border-radius: ${theme.borderRadius.lg};
          box-shadow: ${theme.shadows.md};
        }

        h2 {
          color: ${theme.colors.primary.main};
          margin-bottom: 2rem;
          text-align: center;
        }

        .error-message {
          color: ${theme.colors.error.main};
          background: ${theme.colors.error.light};
          padding: 1rem;
          border-radius: ${theme.borderRadius.md};
          margin-bottom: 1rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          color: ${theme.colors.text.secondary};
        }

        input, select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid ${theme.colors.border};
          border-radius: ${theme.borderRadius.md};
          font-size: 1rem;
        }

        input:focus, select:focus {
          outline: none;
          border-color: ${theme.colors.primary.main};
          box-shadow: 0 0 0 2px ${theme.colors.primary.light};
        }

        input:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }

        .button-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-top: 2rem;
        }
      `}</style>
    </div>
  );
}