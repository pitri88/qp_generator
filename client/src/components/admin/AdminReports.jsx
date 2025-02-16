import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import Header from '../Header';
import Logo from '../../images/profile.png';
import { theme } from '../../styles/theme';

export default function AdminReports() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/admin-dashboard/');
      setAnalytics(response.data.analytics);
      setLoading(false);
    } catch (err) {
      setError('Failed to load analytics data');
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!analytics) return <div>No data available</div>;

  return (
    <>
      <Header name="Analytics & Reports" logo={Logo} />
      <div className="reports-container">
        <div className="analytics-grid">
          <div className="analytics-card">
            <h3>Questions by Course</h3>
            <div className="chart-container">
              {analytics.questions_by_course.map(course => (
                <div key={course.course_id} className="bar-chart-item">
                  <div className="bar-label">{course.course_name}</div>
                  <div className="bar" style={{ width: `${(course.question_count / Math.max(...analytics.questions_by_course.map(c => c.question_count))) * 100}%` }}>
                    {course.question_count}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="analytics-card">
            <h3>Questions by Difficulty</h3>
            <div className="chart-container">
              {analytics.questions_by_difficulty.map(diff => (
                <div key={diff.difficulty_level} className="bar-chart-item">
                  <div className="bar-label">{diff.difficulty_level}</div>
                  <div className="bar" style={{ width: `${(diff.count / Math.max(...analytics.questions_by_difficulty.map(d => d.count))) * 100}%` }}>
                    {diff.count}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="analytics-card">
            <h3>Papers Generated (Last 6 Months)</h3>
            <div className="chart-container">
              {analytics.papers_generated.map(paper => (
                <div key={paper.course_code} className="bar-chart-item">
                  <div className="bar-label">{paper.course_title}</div>
                  <div className="bar" style={{ width: `${(paper.count / Math.max(...analytics.papers_generated.map(p => p.count))) * 100}%` }}>
                    {paper.count}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="analytics-card">
            <h3>Faculty Course Distribution</h3>
            <div className="chart-container">
              {analytics.faculty_course_distribution.map(faculty => (
                <div key={faculty.f_id} className="bar-chart-item">
                  <div className="bar-label">{faculty.name} ({faculty.department_id__dept_name})</div>
                  <div className="bar" style={{ width: `${(faculty.course_count / Math.max(...analytics.faculty_course_distribution.map(f => f.course_count))) * 100}%` }}>
                    {faculty.course_count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .reports-container {
          padding: 2rem;
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .analytics-card {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .analytics-card h3 {
          color: ${theme.colors.primary.main};
          margin-bottom: 1rem;
        }

        .chart-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .bar-chart-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .bar-label {
          min-width: 150px;
          font-size: 0.9rem;
          color: ${theme.colors.text.secondary};
        }

        .bar {
          height: 24px;
          background: ${theme.colors.primary.light};
          border-radius: 4px;
          display: flex;
          align-items: center;
          padding: 0 0.5rem;
          color: white;
          font-size: 0.9rem;
          transition: width 0.3s ease;
        }
      `}</style>
    </>
  );
} 