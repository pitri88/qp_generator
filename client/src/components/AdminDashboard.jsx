import React, { useState, useEffect } from "react";
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Logo from '../images/profile.png';
import { theme } from '../styles/theme';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    departments: 0,
    courses: 0,
    faculty: 0,
    questions: 0
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
        faculty: response.data.stats.faculty,
        questions: response.data.stats.questions
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
      color: theme.colors.secondary.main
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
    },
    {
      title: "Questions",
      count: stats.questions,
      icon: "❓",
      actions: [
        { label: "View All", onClick: () => navigate("/admin/questions") },
        { label: "Add New", onClick: () => navigate("/admin/questions/add") }
      ],
      color: theme.colors.error.main
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

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;
  if (error) return <div className="error-screen">{error}</div>;
    
    return (
    <>
      <Header name="Admin" page="Dashboard" logo={Logo} />
      <div className="admin-dashboard">
        <div className="welcome-section">
          <h1>Welcome to Admin Dashboard</h1>
          <p>Manage your institution's academic resources and faculty</p>
        </div>

        <div className="stats-grid">
          {sections.map((section) => (
            <div className="stat-card" key={section.title}>
              <div className="stat-header" style={{ background: section.color }}>
                <span className="stat-icon">{section.icon}</span>
                <h3>{section.title}</h3>
                <span className="stat-count">{section.count}</span>
              </div>
              <div className="stat-actions">
                {section.actions.map((action) => (
                    <button 
                    key={action.label}
                    onClick={action.onClick}
                    className="action-button"
                  >
                    {action.label}
                      </button>
                ))}
          </div>
            </div>
          ))}
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-grid">
            {quickActions.map((action) => (
              <div 
                key={action.title}
                className="quick-action-card"
                onClick={() => navigate(action.path)}
                style={{ background: action.color }}
              >
                <span className="action-icon">{action.icon}</span>
                <h3>{action.title}</h3>
                <p>{action.description}</p>
          </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-dashboard {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
          background: ${theme.colors.background.light};
          min-height: calc(100vh - 64px);
        }

        .welcome-section {
          text-align: center;
          margin-bottom: 3rem;
          padding: 2rem;
          background: white;
          border-radius: ${theme.borderRadius.lg};
          box-shadow: ${theme.shadows.md};
        }

        .welcome-section h1 {
          color: ${theme.colors.primary.main};
          margin-bottom: 0.5rem;
          font-size: 2.5rem;
        }

        .welcome-section p {
          color: ${theme.colors.text.secondary};
          font-size: 1.1rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .stat-card {
          background: white;
          border-radius: ${theme.borderRadius.lg};
          overflow: hidden;
          box-shadow: ${theme.shadows.md};
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: ${theme.shadows.lg};
        }

        .stat-header {
          padding: 2rem;
          color: white;
          text-align: center;
          position: relative;
        }

        .stat-icon {
          font-size: 2.5rem;
          display: block;
          margin-bottom: 1rem;
        }

        .stat-header h3 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .stat-count {
          font-size: 3rem;
          font-weight: 700;
          display: block;
          margin-top: 1rem;
        }

        .stat-actions {
          padding: 1.5rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .action-button {
          padding: 0.75rem;
          border: none;
          border-radius: ${theme.borderRadius.md};
          background: ${theme.colors.background.default};
          color: ${theme.colors.text.primary};
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }

        .action-button:hover {
          background: ${theme.colors.background.dark};
          color: white;
          transform: scale(1.05);
        }

        .quick-actions {
          background: white;
          padding: 2rem;
          border-radius: ${theme.borderRadius.lg};
          box-shadow: ${theme.shadows.md};
        }

        .quick-actions h2 {
          color: ${theme.colors.text.primary};
          margin-bottom: 2rem;
          font-size: 1.8rem;
          text-align: center;
        }

        .action-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .quick-action-card {
          padding: 2rem;
          border-radius: ${theme.borderRadius.lg};
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
          color: white;
        }

        .quick-action-card:hover {
          transform: scale(1.05);
          box-shadow: ${theme.shadows.lg};
        }

        .action-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 1rem;
        }

        .quick-action-card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .quick-action-card p {
          margin: 0;
          opacity: 0.9;
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
