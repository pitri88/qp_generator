import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import { theme } from '../styles/theme';

export default function UserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile/');
      setProfile(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.response?.data?.error || 'Failed to load profile');
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="loading-state">
      <div className="spinner"></div>
      Loading profile...
    </div>
  );

  if (error) return (
    <div className="error-state">
      <div className="error-icon">!</div>
      {error}
    </div>
  );

  if (!profile) return (
    <div className="empty-state">
      No profile data available
    </div>
  );

  return (
    <>
      <Header page="Profile" />
      <div className="profile-container">
        <div className="profile-layout">
          {/* Profile Overview Card */}
          <div className="profile-card overview-card">
            <div className="profile-header">
              <div className="avatar">
                {profile.name?.charAt(0).toUpperCase()}
              </div>
              <div className="header-info">
                <h2>{profile.name}</h2>
                <p className="role">{profile.role}</p>
                <p className="email">{profile.email}</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          {profile.role === 'faculty' && (
            <div className="profile-card main-card">
              <div className="card-header">
                <h3>Assigned Courses</h3>
                <span className="course-count">
                  {profile.courses?.length || 0} Courses
                </span>
              </div>

              <div className="courses-grid">
                {profile.courses?.length > 0 ? (
                  profile.courses.map(course => (
                    <div key={course.course_id} className="course-card">
                      <div className="course-header">
                        <div className="course-icon">
                          {course.course_name.charAt(0)}
                        </div>
                        <div className="course-info">
                          <h4>{course.course_name}</h4>
                          <p>{course.department}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-courses">
                    <div className="empty-icon">📚</div>
                    <p>No courses assigned yet</p>
                    <span>Courses will appear here once assigned</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .profile-container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .profile-layout {
          display: grid;
          gap: 2rem;
          grid-template-columns: 1fr;
        }

        .profile-card {
          background: white;
          border-radius: ${theme.borderRadius.lg};
          box-shadow: ${theme.shadows.md};
          overflow: hidden;
        }

        .overview-card {
          background: linear-gradient(135deg, ${theme.colors.primary.main}, ${theme.colors.primary.dark});
          color: white;
        }

        .profile-header {
          padding: 2.5rem;
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .avatar {
          width: 100px;
          height: 100px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          font-weight: 500;
          flex-shrink: 0;
          border: 4px solid rgba(255, 255, 255, 0.3);
        }

        .header-info {
          flex: 1;
        }

        h2 {
          margin: 0;
          color: white;
          font-size: 2rem;
          font-weight: 600;
        }

        .role {
          margin: 0.5rem 0;
          font-size: 1.1rem;
          text-transform: capitalize;
          opacity: 0.9;
        }

        .email {
          margin: 0;
          opacity: 0.8;
          font-size: 1rem;
        }

        .main-card {
          padding: 2rem;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        h3 {
          color: ${theme.colors.text.primary};
          font-size: 1.4rem;
          font-weight: 600;
          margin: 0;
        }

        .course-count {
          background: ${theme.colors.primary.light};
          color: ${theme.colors.primary.main};
          padding: 0.5rem 1rem;
          border-radius: ${theme.borderRadius.full};
          font-size: 0.9rem;
          font-weight: 500;
        }

        .courses-grid {
          display: grid;
          gap: 1.5rem;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        }

        .course-card {
          background: white;
          padding: 1.5rem;
          border-radius: ${theme.borderRadius.lg};
          border: 1px solid ${theme.colors.border.main};
          transition: all 0.3s ease;
        }

        .course-card:hover {
          transform: translateY(-4px);
          box-shadow: ${theme.shadows.md};
          border-color: ${theme.colors.primary.light};
        }

        .course-header {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .course-icon {
          width: 48px;
          height: 48px;
          background: ${theme.colors.primary.light};
          color: ${theme.colors.primary.main};
          border-radius: ${theme.borderRadius.lg};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          font-weight: 600;
        }

        .course-info h4 {
          margin: 0;
          color: ${theme.colors.text.primary};
          font-size: 1.1rem;
          font-weight: 600;
        }

        .course-info p {
          margin: 0.25rem 0 0;
          color: ${theme.colors.text.secondary};
          font-size: 0.9rem;
        }

        .no-courses {
          grid-column: 1 / -1;
          text-align: center;
          padding: 3rem;
          background: ${theme.colors.background.light};
          border-radius: ${theme.borderRadius.lg};
          border: 2px dashed ${theme.colors.border.main};
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .no-courses p {
          margin: 0;
          color: ${theme.colors.text.primary};
          font-size: 1.1rem;
          font-weight: 500;
        }

        .no-courses span {
          display: block;
          margin-top: 0.5rem;
          color: ${theme.colors.text.secondary};
          font-size: 0.9rem;
        }

        .loading-state,
        .error-state,
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: ${theme.borderRadius.lg};
          box-shadow: ${theme.shadows.md};
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid ${theme.colors.primary.light};
          border-top-color: ${theme.colors.primary.main};
          border-radius: 50%;
          margin: 0 auto 1.5rem;
          animation: spin 1s linear infinite;
        }

        .error-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: ${theme.colors.error.main};
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          font-weight: bold;
          margin: 0 auto 1.5rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .profile-header {
            flex-direction: column;
            text-align: center;
            gap: 1.5rem;
          }

          .header-info {
            text-align: center;
          }

          .courses-grid {
            grid-template-columns: 1fr;
          }
        }
        .profile-container {
          padding: 2rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        .profile-card {
          background: white;
          border-radius: ${theme.borderRadius.lg};
          box-shadow: ${theme.shadows.md};
          overflow: hidden;
        }

        .profile-header {
          background: white;
          border-bottom: 1px solid ${theme.colors.border.main};
          padding: 2rem;
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .avatar {
          width: 80px;
          height: 80px;
          background: white;
          color: ${theme.colors.primary.main};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: bold;
          margin: 0 auto 1rem;
        }

        .role {
          font-size: 0.9rem;
          opacity: 0.9;
          margin-top: 0.5rem;
        }

        .profile-details {
          padding: 2rem;
        }

        .detail-item {
          margin-bottom: 1.5rem;
        }

        .detail-item label {
          color: ${theme.colors.text.secondary};
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          display: block;
        }

        .detail-item p {
          margin: 0;
          color: ${theme.colors.text.primary};
          font-size: 1.1rem;
        }

        .courses-list {
          display: grid;
          gap: 0.5rem;
        }

        .course-item {
          background: ${theme.colors.background.paper};
          padding: 0.75rem;
          border-radius: ${theme.borderRadius.md};
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .course-dept {
          font-size: 0.9rem;
          color: ${theme.colors.text.secondary};
        }
      `}</style>
    </>
  );
} 