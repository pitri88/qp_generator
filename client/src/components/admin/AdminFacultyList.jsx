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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const response = await api.get('/faculty/');
      console.log('Faculty:', response.data);
      setFaculty(response.data.faculty || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching faculty:', err);
      setError('Failed to load faculty data');
      setLoading(false);
    }
  };

  const handleDelete = async (fId) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      try {
        await api.delete(`/faculty/${fId}/`);
        fetchFaculty();
      } catch (err) {
        setError('Failed to delete faculty member');
      }
    }
  };

  if (loading) return <div className="loading">Loading faculty data...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <>
      <Header name="Faculty Management" logo={Logo} />
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

        <div className="faculty-grid">
          {faculty.map((f) => (
            <div key={f.f_id} className="faculty-card">
              <div className="card-header">
                <h3>{f.name}</h3>
                <p className="email">{f.email}</p>
              </div>

              <div className="courses-section">
                <h4>Assigned Courses ({f.course_count})</h4>
                <div className="courses-list">
                  {f.courses.map((course) => (
                    <div key={course.course_id} className="course-item">
                      <div className="course-info">
                        <span className="course-code">{course.course_id}</span>
                        <span className="course-name">{course.course_name}</span>
                      </div>
                      <span className="course-dept">{course.department_name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-actions">
                <button 
                  className="edit-btn"
                  onClick={() => navigate(`/admin/faculty/${f.f_id}/edit`)}
                >
                  Edit
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => handleDelete(f.f_id)}
                >
                  Delete
                </button>
              </div>
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

        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .faculty-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 2rem;
        }

        .faculty-card {
          background: white;
          --card-color: ${theme.colors.success.main};
          border-top: 4px solid var(--card-color);
          border-radius: ${theme.borderRadius.lg};
          box-shadow: ${theme.shadows.md};
          overflow: hidden;
        }

        .card-header {
          padding: 1.5rem;
          border-bottom: 1px solid ${theme.colors.border};
          color: var(--card-color);
        }

        .card-header h3 {
          margin: 0;
          font-size: 1.25rem;
        }

        .email {
          margin: 0.5rem 0 0;
          font-size: 0.9rem;
          color: ${theme.colors.text.secondary};
        }

        .courses-section {
          padding: 1.5rem;
        }

        .courses-section h4 {
          margin: 0 0 1rem 0;
          color: ${theme.colors.text.primary};
        }

        .courses-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .course-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: ${theme.colors.background.default};
          border-radius: ${theme.borderRadius.md};
          border: 1px solid ${theme.colors.border};
        }

        .course-info {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .course-code {
          font-weight: 600;
          color: var(--card-color);
          font-size: 0.9rem;
        }

        .course-name {
          color: ${theme.colors.text.primary};
        }

        .course-dept {
          padding: 0.25rem 0.75rem;
          background: ${theme.colors.background.light};
          color: var(--card-color);
          border-radius: ${theme.borderRadius.full};
          font-size: 0.8rem;
          font-weight: 500;
        }

        .card-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          padding: 1rem 1.5rem;
          background: ${theme.colors.background.default};
          border-top: 1px solid ${theme.colors.border};
        }

        .edit-btn, .delete-btn {
          padding: 0.5rem;
          border: none;
          border-radius: ${theme.borderRadius.md};
          cursor: pointer;
          font-weight: 500;
          transition: opacity 0.2s;
        }

        .edit-btn:hover, .delete-btn:hover {
          opacity: 0.9;
        }

        .edit-btn {
          background: ${theme.colors.primary.main};
          color: white;
        }

        .delete-btn {
          background: ${theme.colors.error.main};
          color: white;
        }
      `}</style>
    </>
  );
} 