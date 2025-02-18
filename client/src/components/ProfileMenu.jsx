import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { theme } from '../styles/theme';

export default function ProfileMenu({ userRole }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const displayName = user?.name || 'User';
  const displayEmail = user?.email || '';

  const handleLogout = async () => {
    try {
      await logout();
      setProfileData(null); // Clear profile data on logout
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="profile-menu">
      <div className="profile-icon" onClick={() => setIsOpen(!isOpen)}>
        <span className="initial">{getInitials(displayName)[0]}</span>
      </div>
      
      {isOpen && (
        <div className="dropdown-menu">
          <div className="user-info">
            <span className="name">{displayName}</span>
            <span className="email">{displayEmail}</span>
            <span className="role">{userRole}</span>
          </div>
          <div className="menu-items">
            <button onClick={() => {
              setIsOpen(false);
              const role = userRole.toLowerCase();
              navigate(`/${role}/profile`);
            }}>
              View Profile
            </button>
            <button onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .profile-menu {
          position: relative;
        }

        .profile-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: ${theme.colors.primary.main};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .profile-icon:hover {
          opacity: 0.9;
        }

        .initial {
          color: white;
          font-weight: 500;
          font-size: 1rem;
          text-transform: uppercase;
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.5rem;
          background: white;
          border-radius: ${theme.borderRadius.md};
          box-shadow: ${theme.shadows.lg};
          min-width: 200px;
          z-index: 1000;
        }

        .user-info {
          padding: 1rem;
          border-bottom: 1px solid ${theme.colors.border};
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .name {
          font-weight: 600;
          color: ${theme.colors.text.primary};
        }

        .email {
          font-size: 0.9rem;
          color: ${theme.colors.text.secondary};
        }

        .role {
          font-size: 0.8rem;
          color: ${theme.colors.primary.main};
          font-weight: 500;
          text-transform: uppercase;
        }

        .menu-items {
          padding: 0.5rem;
        }

        .menu-items button {
          width: 100%;
          padding: 0.5rem 1rem;
          text-align: left;
          background: none;
          border: none;
          border-radius: ${theme.borderRadius.sm};
          cursor: pointer;
          color: ${theme.colors.text.primary};
          transition: background-color 0.2s;
        }

        .menu-items button:hover {
          background: ${theme.colors.background.hover};
        }
      `}</style>
    </div>
  );
} 