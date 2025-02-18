import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../utils/api';
import Header from '../Header';
import Logo from '../../images/profile.png';

export default function FacultyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(() => ({
    name: '',
    email: '',
    password: ''
  }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset form data when component mounts or id changes
  useEffect(() => {
    setFormData({
      name: '',
      email: '',
      password: ''
    });
    
    if (id) {
      fetchFaculty();
    }
  }, [id]);

  const fetchFaculty = async () => {
    try {
      const response = await api.get('/faculty/', {
        params: { f_id: id }
      });
      const faculty = response.data.faculty;
      if (faculty) {
        setFormData({
          name: faculty.name,
          email: faculty.email,
          password: ''
        });
      } else {
        setError('Faculty not found');
      }
    } catch (error) {
      setError('Failed to fetch faculty details');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (id) {
        await api.put('/faculty/', {
          faculty_id: id,  // Backend expects faculty_id in PUT request
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
      } else {
        // For new faculty, send all required fields
        await api.post('/faculty/', {
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
      }
      // Navigate to faculty list after successful submission
      navigate('/admin/faculty');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save faculty');
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
    <div className="admin-form-container">
      <Header name="Admin" page={id ? 'Edit Faculty' : 'Add Faculty'} logo={Logo} />
      
      <div className="form-content">
        <h2>{id ? 'Edit Faculty' : 'Add New Faculty'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Faculty Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              {id ? 'Password (leave blank to keep current)' : 'Password'}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!id}
              className="form-control"
            />
          </div>

          <div className="button-group">
            <button type="button" onClick={() => navigate('/admin/faculty')} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {id ? 'Update Faculty' : 'Add Faculty'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .admin-form-container {
          min-height: 100vh;
          background-color: #f5f6fa;
        }

        .form-content {
          max-width: 600px;
          margin: 2rem auto;
          padding: 2rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        h2 {
          color: #417690;
          margin-bottom: 1.5rem;
        }

        .error-message {
          background: #fff1f0;
          border: 1px solid #ffa39e;
          padding: 0.75rem;
          border-radius: 4px;
          color: #cf1322;
          margin-bottom: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #2c3e50;
          font-weight: 500;
        }

        input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }

        input:focus {
          border-color: #417690;
          outline: none;
          box-shadow: 0 0 0 2px rgba(65,118,144,0.2);
        }

        .button-group {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }

        button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .btn-primary {
          background: #417690;
          color: white;
        }

        .btn-primary:hover {
          background: #205067;
        }

        .btn-primary:disabled {
          background: #97a5ac;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #f8f9fa;
          color: #2c3e50;
          border: 1px solid #ddd;
        }

        .btn-secondary:hover {
          background: #e9ecef;
        }
      `}</style>
    </div>
  );
} 