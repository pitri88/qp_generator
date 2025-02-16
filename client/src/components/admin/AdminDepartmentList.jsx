import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import Header from '../Header';
import Logo from '../../images/profile.png';
import { theme } from '../../styles/theme';
import { Button } from '../common/Button';

export default function AdminDepartmentList() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/department/');
      setDepartments(response.data.departments);
      setLoading(false);
    } catch (err) {
      setError('Failed to load departments');
      setLoading(false);
    }
  };

  const handleDelete = async (deptId) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await api.delete(`/department/${deptId}/`);
        fetchDepartments();
      } catch (err) {
        setError('Failed to delete department');
      }
    }
  };

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;
  if (error) return <div className="error-screen">{error}</div>;

  return (
    <>
      <Header name="Departments" logo={Logo} />
      <div className="container">
        <div className="header-section">
          <h1>Manage Departments</h1>
          <Button 
            onClick={() => navigate('/admin/departments/add')}
            variant="primary"
          >
            Add New Department
          </Button>
        </div>

        <div className="card-grid">
          {departments.map((dept) => (
            <div key={dept.dept_id} className="department-card">
              <div className="card-header">
                <span className="dept-icon">🏢</span>
                <h3>{dept.dept_name}</h3>
              </div>
              <div className="card-content">
                <div className="stat-item">
                  <span className="label">Courses</span>
                  <span className="value">{dept.course_count}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Faculty</span>
                  <span className="value">{dept.faculty_count}</span>
                </div>
              </div>
              <div className="card-actions">
                <button 
                  className="edit-btn"
                  onClick={() => navigate(`/admin/departments/${dept.dept_id}/edit`)}
                >
                  Edit
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => handleDelete(dept.dept_id)}
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
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
        }

        .department-card {
          background: white;
          border-radius: ${theme.borderRadius.lg};
          overflow: hidden;
          box-shadow: ${theme.shadows.md};
          transition: all 0.3s ease;
        }

        .department-card:hover {
          transform: translateY(-5px);
          box-shadow: ${theme.shadows.lg};
        }

        .card-header {
          background: ${theme.colors.primary.main};
          color: white;
          padding: 1.5rem;
          text-align: center;
        }

        .dept-icon {
          font-size: 2.5rem;
          display: block;
          margin-bottom: 0.5rem;
        }

        .card-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .card-content {
          padding: 1.5rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .stat-item {
          text-align: center;
        }

        .label {
          display: block;
          color: ${theme.colors.text.secondary};
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }

        .value {
          font-size: 1.5rem;
          font-weight: 600;
          color: ${theme.colors.text.primary};
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
          background: ${theme.colors.primary.light};
          color: white;
        }

        .edit-btn:hover {
          background: ${theme.colors.primary.main};
        }

        .delete-btn {
          background: ${theme.colors.error.light};
          color: white;
        }

        .delete-btn:hover {
          background: ${theme.colors.error.main};
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
          border-top: 5px solid ${theme.colors.primary.main};
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