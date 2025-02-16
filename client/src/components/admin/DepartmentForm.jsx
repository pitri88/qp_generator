import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../utils/api';
import Header from '../Header';
import Logo from '../../images/profile.png';

export default function DepartmentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    dept_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchDepartment();
    }
  }, [id]);

  const fetchDepartment = async () => {
    try {
      const response = await api.get('/department/', {
        params: { dept_id: id }
      });
      const department = response.data.departments.find(d => d.dept_id === id);
      if (department) {
        setFormData({
          dept_name: department.dept_name
        });
      }
    } catch (error) {
      setError('Failed to fetch department details');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (id) {
        await api.put('/department/', {
          dept_id: id,
          ...formData
        });
      } else {
        await api.post('/department/', formData);
      }
      navigate('/admin-dashboard');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save department');
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
      <Header name="Admin" page={id ? 'Edit Department' : 'Add Department'} logo={Logo} />
      
      <div className="form-content">
        <h2>{id ? 'Edit Department' : 'Add New Department'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="dept_name">Department Name</label>
            <input
              type="text"
              id="dept_name"
              name="dept_name"
              value={formData.dept_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate('/admin-dashboard')}
              className="cancel-button"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="submit-button"
            >
              {loading ? 'Saving...' : (id ? 'Update Department' : 'Add Department')}
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

        .form-actions {
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

        .submit-button {
          background: #417690;
          color: white;
        }

        .submit-button:hover {
          background: #205067;
        }

        .submit-button:disabled {
          background: #97a5ac;
          cursor: not-allowed;
        }

        .cancel-button {
          background: #f8f9fa;
          color: #2c3e50;
          border: 1px solid #ddd;
        }

        .cancel-button:hover {
          background: #e9ecef;
        }
      `}</style>
    </div>
  );
} 