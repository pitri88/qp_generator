import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import Header from './Header';
import Logo from '../images/profile.png';
import { theme } from '../styles/theme';

export default function FacultyProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token || userRole !== 'faculty') {
      navigate('/login-faculty');
      return;
    }

    fetchProfile();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile/');
      console.log('Profile response:', response.data);
      setProfile(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout/');
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('name');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to logout. Please try again.');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!profileImage) return;
    
    try {
      const formData = new FormData();
      formData.append('profile_image', profileImage);
      
      await api.post('/profile/update-image/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Refresh profile data
      fetchProfile();
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to update profile image');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <>
      <Header name={localStorage.getItem('name')} page="Profile" logo={Logo} />
      <div className="profile-container">
        {profile && (
          <div className="profile-content">
            <div className="profile-header">
              <div className="image-container">
                <img 
                  src={imagePreview || profile.profile_image || Logo} 
                  alt="Profile" 
                  className="profile-image" 
                />
                <div className="image-overlay">
                  <label htmlFor="profile-image-input" className="edit-image-button">
                    Edit
                  </label>
                  <input
                    id="profile-image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
              <h2>Faculty Profile</h2>
            </div>
            {profileImage && (
              <button 
                className="save-image-button" 
                onClick={handleImageUpload}
              >
                Save New Image
              </button>
            )}
            <div className="profile-info">
              <div className="info-group">
                <label>Name:</label>
                <span>{profile.name}</span>
              </div>
              <div className="info-group">
                <label>Email:</label>
                <span>{profile.email}</span>
              </div>
              <div className="info-group">
                <label>Faculty ID:</label>
                <span>{profile.f_id}</span>
              </div>
              <div className="info-group">
                <label>Department:</label>
                <span>{profile.department_id?.dept_name || 'Not assigned'}</span>
              </div>
            </div>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .profile-container {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
          min-height: calc(100vh - 64px);
          display: flex;
          align-items: center;
          background: #f3f4f6;
        }

        .profile-content {
          background: white;
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          width: 100%;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #e5e7eb;
        }

        .image-container {
          position: relative;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          overflow: hidden;
        }

        .profile-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          border: 3px solid ${theme.colors.primary.main};
          padding: 2px;
        }

        h2 {
          color: #1a237e;
          margin-bottom: 24px;
          padding-bottom: 12px;
          font-size: 1.8rem;
          margin: 0;
        }

        .profile-info {
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: #f8f9fa;
          padding: 20px;
          border-radius: 6px;
        }

        .info-group {
          display: flex;
          gap: 16px;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .info-group label {
          font-weight: bold;
          min-width: 120px;
          color: #4a5568;
        }

        .info-group span {
          color: #1a237e;
          font-weight: 500;
        }

        .logout-button {
          margin-top: 24px;
          padding: 10px 20px;
          background-color: #dc2626;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
          width: 100%;
          font-weight: 500;
          font-size: 1rem;
        }

        .logout-button:hover {
          background-color: #b91c1c;
        }

        .error-message {
          color: #dc2626;
          text-align: center;
          margin-top: 20px;
          padding: 12px;
          background: #fef2f2;
          border-radius: 4px;
          border: 1px solid #fecaca;
        }

        .image-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.7);
          padding: 8px 0;
          text-align: center;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .image-container:hover .image-overlay {
          opacity: 1;
        }

        .edit-image-button {
          color: white;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .save-image-button {
          background: ${theme.colors.success.main};
          color: white;
          border: none;
          border-radius: ${theme.borderRadius.md};
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          margin-top: 1rem;
          width: auto;
          align-self: center;
          transition: background-color 0.2s;
        }

        .save-image-button:hover {
          background: ${theme.colors.success.dark};
        }
      `}</style>
    </>
  );
} 