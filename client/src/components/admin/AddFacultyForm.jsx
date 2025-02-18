import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { theme } from '../../styles/theme';
import { Button } from '../common/Button';

export default function AddFacultyForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    faculty_name: '',
    email: '',
    password: '',
    dept_id: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(false);

    // Validate required fields
    const requiredFields = ['faculty_name', 'email', 'password'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setError(`Missing required fields: ${missingFields.join(', ')}`);
      setLoading(false);
      return;
    }

    try {
      console.log('Sending form data:', formData);

      const response = await api.post('/faculty/', {
        faculty_name: formData.faculty_name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        dept_id: formData.dept_id ? formData.dept_id.trim() : null
      });

      console.log('Faculty created:', response.data);
      navigate('/admin/faculty');
    } catch (err) {
      console.error('Error creating faculty:', err.response?.data || err);
      setError(err.response?.data?.error || 'Failed to create faculty');
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
      <h2>Add New Faculty</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="faculty_name">Faculty Name *</label>
          <input
            type="text"
            id="faculty_name"
            name="faculty_name"
            value={formData.faculty_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password *</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="dept_id">Department ID</label>
          <input
            type="text"
            id="dept_id"
            name="dept_id"
            value={formData.dept_id}
            onChange={handleChange}
          />
        </div>

        <div className="button-group">
          <Button 
            type="submit" 
            disabled={loading}
            variant="primary"
          >
            {loading ? 'Creating...' : 'Create Faculty'}
          </Button>
          <Button 
            type="button" 
            onClick={() => navigate('/admin/faculty')}
            variant="secondary"
          >
            Cancel
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

        input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid ${theme.colors.border};
          border-radius: ${theme.borderRadius.md};
          font-size: 1rem;
        }

        input:focus {
          outline: none;
          border-color: ${theme.colors.primary.main};
          box-shadow: 0 0 0 2px ${theme.colors.primary.light};
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