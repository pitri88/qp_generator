import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import Header from '../Header';
import Logo from '../../images/profile.png';
import { theme } from '../../styles/theme';
import { Button } from '../common/Button';

export default function AdminQuestionList() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await api.get('/question/');
      setQuestions(response.data.questions);
      setLoading(false);
    } catch (err) {
      setError('Failed to load questions');
      setLoading(false);
    }
  };

  const handleDelete = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await api.delete(`/question/${questionId}/`);
        fetchQuestions();
      } catch (err) {
        setError('Failed to delete question');
      }
    }
  };

  const getDifficultyColor = (level) => {
    switch (level.toLowerCase()) {
      case 'easy': return theme.colors.success.light;
      case 'medium': return theme.colors.warning.main;
      case 'hard': return theme.colors.error.light;
      default: return theme.colors.primary.light;
    }
  };

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;
  if (error) return <div className="error-screen">{error}</div>;

  return (
    <>
      <Header name="Questions" logo={Logo} />
      <div className="container">
        <div className="header-section">
          <h1>Manage Questions</h1>
          <Button 
            onClick={() => navigate('/admin/questions/add')}
            variant="primary"
          >
            Add New Question
          </Button>
        </div>

        <div className="card-grid">
          {questions.map((question) => (
            <div key={question.q_id} className="question-card">
              <div className="card-header">
                <span className="question-icon">❓</span>
                <div className="question-meta">
                  <span className="course-unit">
                    {question.course_name} - Unit {question.unit_id}
                  </span>
                  <span 
                    className="difficulty-badge"
                    style={{ background: getDifficultyColor(question.difficulty_level) }}
                  >
                    {question.difficulty_level}
                  </span>
                </div>
              </div>
              <div className="card-content">
                <div className="question-text">
                  {question.text}
                </div>
                <div className="question-details">
                  <div className="detail-item">
                    <span className="label">CO</span>
                    <span className="value">{question.co}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">BT Level</span>
                    <span className="value">{question.bt}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Marks</span>
                    <span className="value">{question.marks}</span>
                  </div>
                </div>
                {question.tags && question.tags.length > 0 && (
                  <div className="tags-container">
                    {question.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="card-actions">
                <button 
                  className="edit-btn"
                  onClick={() => navigate(`/admin/questions/${question.q_id}/edit`)}
                >
                  Edit
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => handleDelete(question.q_id)}
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
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 2rem;
        }

        .question-card {
          background: white;
          border-radius: ${theme.borderRadius.lg};
          overflow: hidden;
          box-shadow: ${theme.shadows.md};
          transition: all 0.3s ease;
        }

        .question-card:hover {
          transform: translateY(-5px);
          box-shadow: ${theme.shadows.lg};
        }

        .card-header {
          background: ${theme.colors.error.main};
          color: white;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .question-icon {
          font-size: 2rem;
        }

        .question-meta {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .course-unit {
          font-weight: 600;
          font-size: 1.1rem;
        }

        .difficulty-badge {
          padding: 0.25rem 0.75rem;
          border-radius: ${theme.borderRadius.full};
          font-size: 0.875rem;
          font-weight: 500;
        }

        .card-content {
          padding: 1.5rem;
        }

        .question-text {
          font-size: 1.1rem;
          color: ${theme.colors.text.primary};
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }

        .question-details {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1rem;
          padding: 1rem;
          background: ${theme.colors.background.light};
          border-radius: ${theme.borderRadius.md};
        }

        .detail-item {
          text-align: center;
        }

        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .tag {
          background: ${theme.colors.primary.light};
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: ${theme.borderRadius.full};
          font-size: 0.875rem;
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
          background: ${theme.colors.error.light};
          color: white;
        }

        .edit-btn:hover {
          background: ${theme.colors.error.main};
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
          border-top: 5px solid ${theme.colors.error.main};
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