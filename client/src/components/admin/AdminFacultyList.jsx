import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import Header from '../Header';
import Logo from '../../images/profile.png';
import { theme } from '../../styles/theme';
import { Button } from '../common/Button';

export default function AdminFacultyList() {
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newFaculty, setNewFaculty] = useState({
    f_id: '',
    name: '',
    email: '',
    password: '',
    department_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [facultyResponse, deptsResponse] = await Promise.all([
        api.get('/faculty/'),
        api.get('/department/')
      ]);
      console.log('Faculty:', facultyResponse.data);
      console.log('Departments:', deptsResponse.data);
      setFaculty(facultyResponse.data.faculty);
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
      const requiredFields = ['f_id', 'name', 'email', 'password'];
      const missingFields = requiredFields.filter(field => !newFaculty[field]);
      
      if (missingFields.length > 0) {
        setError(`Missing required fields: ${missingFields.join(', ')}`);
        return;
      }

      const response = await api.post('/faculty/', {
        f_id: newFaculty.f_id,
        name: newFaculty.name,
        email: newFaculty.email,
        password: newFaculty.password,
        department_id: newFaculty.department_id || null
      });

      console.log('Faculty created:', response.data);
      setNewFaculty({
        f_id: '',
        name: '',
        email: '',
        password: '',
        department_id: ''
      });
      setError(null);
      fetchData();
    } catch (error) {
      console.error('Error creating faculty:', error);
      setError(error.response?.data?.error || 'Failed to create faculty');
    }
  };

  const getDepartmentName = (deptId) => {
    const dept = departments.find(d => d.dept_id === deptId);
    return dept ? dept.dept_name : 'Not Assigned';
  };

  const handleDelete = async (facultyId) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      try {
        await api.delete(`/faculty/${facultyId}/`);
        fetchData();
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to delete faculty');
      }
    }
  };

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;
  if (error) return <div className="error-screen">{error}</div>;

  return (
    <>
      <Header name="Faculty" logo={Logo} />
      <div className="container">
        <div className="header-section">
          <h1>Manage Faculty</h1>
          <Button 
            onClick={() => navigate('/admin/faculty/add')}
            variant="primary"
          >
            Add New Faculty
          </Button>
        </div>

        <div className="card-grid">
          {faculty.map((member) => (
            <div key={member.f_id} className="faculty-card">
              <div className="card-header">
                <span className="faculty-icon">👨‍🏫</span>
                <h3>{member.name}</h3>
                <div className="faculty-id">ID: {member.f_id}</div>
              </div>
              <div className="card-content">
                <div className="info-item">
                  <span className="label">Email</span>
                  <span className="value">{member.email}</span>
                </div>
                <div className="info-item">
                  <span className="label">Department</span>
                  <span className="value">{getDepartmentName(member.department_id)}</span>
                </div>
                <div className="stats-container">
                  <div className="stat-item">
                    <span className="label">Courses</span>
                    <span className="value">{member.course_count || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="label">Papers</span>
                    <span className="value">{member.paper_count || 0}</span>
                  </div>
                </div>
              </div>
              <div className="card-actions">
                <button 
                  className="edit-btn"
                  onClick={() => navigate(`/admin/faculty/${member.f_id}/edit`)}
                >
                  Edit
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => handleDelete(member.f_id)}
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

        .faculty-card {
          background: white;
          border-radius: ${theme.borderRadius.lg};
          overflow: hidden;
          box-shadow: ${theme.shadows.md};
          transition: all 0.3s ease;
        }

        .faculty-card:hover {
          transform: translateY(-5px);
          box-shadow: ${theme.shadows.lg};
        }

        .card-header {
          background: ${theme.colors.success.main};
          color: white;
          padding: 1.5rem;
          text-align: center;
          position: relative;
        }

        .faculty-icon {
          font-size: 2.5rem;
          display: block;
          margin-bottom: 0.5rem;
        }

        .card-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .faculty-id {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.25rem 0.5rem;
          border-radius: ${theme.borderRadius.sm};
          font-size: 0.875rem;
        }

        .card-content {
          padding: 1.5rem;
        }

        .info-item {
          margin-bottom: 1rem;
        }

        .stats-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid ${theme.colors.border};
        }

        .stat-item {
          text-align: center;
          padding: 0.5rem;
          background: ${theme.colors.background.light};
          border-radius: ${theme.borderRadius.md};
        }

        .label {
          display: block;
          color: ${theme.colors.text.secondary};
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }

        .value {
          font-size: 1.1rem;
          font-weight: 600;
          color: ${theme.colors.text.primary};
          word-break: break-word;
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
          background: ${theme.colors.success.light};
          color: white;
        }

        .edit-btn:hover {
          background: ${theme.colors.success.main};
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
          border-top: 5px solid ${theme.colors.success.main};
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