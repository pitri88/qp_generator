import React, { useState, useEffect } from "react";
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

import { theme } from '../styles/theme';
import { useAuth } from '../contexts/AuthContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    departments: 0,
    courses: 0,
    faculty: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/admin-dashboard/');
      setStats({
        departments: response.data.stats.departments,
        courses: response.data.stats.courses,
        faculty: response.data.stats.faculty
      });
      setLoading(false);
    } catch (error) {
      console.error('Dashboard error:', error);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const sections = [
    {
      title: "Departments",
      count: stats.departments,
      icon: "🏢",
      actions: [
        { label: "View All", onClick: () => navigate("/admin/departments") },
        { label: "Add New", onClick: () => navigate("/admin/departments/add") }
      ],
      color: theme.colors.primary.main
    },
    {
      title: "Courses",
      count: stats.courses,
      icon: "📚",
      actions: [
        { label: "View All", onClick: () => navigate("/admin/courses") },
        { label: "Add New", onClick: () => navigate("/admin/courses/add") }
      ],
      color: theme.colors.warning.main
    },
    {
      title: "Faculty",
      count: stats.faculty,
      icon: "👨‍🏫",
      actions: [
        { label: "View All", onClick: () => navigate("/admin/faculty") },
        { label: "Add New", onClick: () => navigate("/admin/faculty/add") }
      ],
      color: theme.colors.success.main
    }
  ];

  const quickActions = [
    {
      title: "Assign Course to Faculty",
      icon: "🔗",
      description: "Map courses to faculty members",
      path: '/admin/faculty-course/assign',
      color: theme.colors.primary.light
    },
    {
      title: "Assign Course to Department",
      icon: "🏢",
      description: "Map courses to departments",
      path: '/admin/department-course/assign',
      color: theme.colors.secondary.light
    },
    {
      title: "Analytics & Reports",
      icon: "📊",
      description: "View statistics and analytics",
      path: '/admin/reports',
      color: theme.colors.success.light
    }
  ];

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>Error: {error}</div>;
    
    return (
    <>
      <Header page="Admin Dashboard" />
      
      <div className="dashboard-container">
        <div className="stats-grid">
          {sections.map((section, index) => (
            <div key={index} className="stat-card" style={{ borderColor: section.color, '--card-color': section.color }}>
              <div className="stat-header">
                <span className="stat-icon">{section.icon}</span>
                <h3>{section.title}</h3>
          </div>
              <div className="stat-count">{section.count}</div>
              <div className="stat-actions">
                {section.actions.map((action, idx) => (
                  <button key={idx} onClick={action.onClick}>
                    {action.label}
          </button>
                ))}
        </div>
      </div>
          ))}
        </div>

        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => (
            <div
              key={index}
              className="quick-action-card"
              style={{ backgroundColor: action.color }}
              onClick={() => navigate(action.path)}
            >
              <span className="action-icon">{action.icon}</span>
              <h3 style={{ color: 'white' }}>{action.title}</h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{action.description}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .dashboard-container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: ${theme.borderRadius.lg};
          box-shadow: ${theme.shadows.md};
          border-top: 4px solid;
          --card-color: ${theme.colors.primary.main};
        }

        .stat-header {
          color: var(--card-color);
        }

        .stat-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .stat-icon {
          font-size: 1.5rem;
        }

        .stat-header h3 {
          margin: 0;
          color: inherit;
          font-weight: 600;
        }

        .stat-count {
          font-size: 2.5rem;
          font-weight: 600;
          color: var(--card-color);
          margin: 1rem 0;
        }

        .stat-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }

        .stat-card button {
          padding: 0.5rem;
          border: none;
          border-radius: ${theme.borderRadius.md};
          background: var(--card-color);
          color: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .stat-card button:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }

        .stat-card button:hover {
          opacity: 0.9;
        }

        .section-title {
          margin: 2rem 0;
          color: ${theme.colors.text.primary};
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .quick-action-card {
          padding: 1.5rem;
          border-radius: ${theme.borderRadius.lg};
          color: white;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .quick-action-card:hover {
          transform: translateY(-2px);
        }

        .action-icon {
          font-size: 2rem;
          display: block;
          margin-bottom: 1rem;
        }

        .quick-action-card h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.2rem;
        }

        .quick-action-card p {
          margin: 0;
          opacity: 0.9;
          font-size: 0.9rem;
        }
      `}</style>
    </>
  );
}
