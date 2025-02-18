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
      setQuestions(response.data.questions || []);
    } catch (err) {
      setError('Failed to load questions');
      console.error('Error fetching questions:', err);
    } finally {
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

  if (loading) return <div className="loading">Loading questions...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="question-list-page">
      <Header name="Question Bank" logo={Logo} />
      
      <div className="content">
        <div className="top-bar">
          <div className="stats">
            <div className="stat-item">
              <span className="stat-value">{questions.length}</span>
              <span className="stat-label">Total Questions</span>
            </div>
            {/* Add more stats as needed */}
          </div>
          <Button 
            onClick={() => navigate('/admin/questions/add')}
            variant="primary"
          >
            Add New Question
          </Button>
        </div>

        <div className="questions-grid">
          {questions.map((question) => (
            <div key={question.q_id} className="question-card">
              <div className="card-header">
                <div className="course-info">
                  <span className="course-name">{question.course_name}</span>
                  <span className="unit">Unit {question.unit_id}</span>
                </div>
                <div className="marks">{question.marks} marks</div>
              </div>

              <div className="question-content">
                <p className="question-text">{question.text}</p>
                
                <div className="tags">
                  <span className="tag co">CO {question.co}</span>
                  <span className="tag bt">BT {question.bt}</span>
                  <span className={`tag difficulty ${question.difficulty_level.toLowerCase()}`}>
                    {question.difficulty_level}
                  </span>
                </div>
              </div>

              <div className="card-actions">
                <button 
                  className="action-btn edit"
                  onClick={() => navigate(`/admin/questions/${question.q_id}`)}
                  aria-label="Edit question"
                >
                  <span role="img" aria-hidden="true">✏️</span>
                </button>
                <button 
                  className="action-btn delete"
                  onClick={() => handleDelete(question.q_id)}
                  aria-label="Delete question"
                >
                  <span role="img" aria-hidden="true">🗑️</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .question-list-page {
          padding: 2rem;
        }

        .content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .stats {
          display: flex;
          gap: 2rem;
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          display: block;
          font-size: 2rem;
          font-weight: bold;
          color: ${theme.colors.primary.main};
        }

        .stat-label {
          color: ${theme.colors.text.secondary};
        }

        .questions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .question-card {
          background: white;
          border-radius: ${theme.borderRadius.lg};
          box-shadow: ${theme.shadows.md};
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .course-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .course-name {
          font-weight: 600;
          color: ${theme.colors.text.primary};
        }

        .unit {
          font-size: 0.875rem;
          color: ${theme.colors.text.secondary};
        }

        .marks {
          background: ${theme.colors.primary.light};
          color: ${theme.colors.primary.main};
          padding: 0.25rem 0.75rem;
          border-radius: ${theme.borderRadius.full};
          font-weight: 500;
        }

        .question-content {
          flex: 1;
        }

        .question-text {
          margin-bottom: 1rem;
          color: ${theme.colors.text.primary};
          line-height: 1.5;
        }

        .tags {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .tag {
          padding: 0.25rem 0.75rem;
          border-radius: ${theme.borderRadius.full};
          font-size: 0.875rem;
          font-weight: 500;
        }

        .tag.co {
          background: ${theme.colors.info.light};
          color: ${theme.colors.info.main};
        }

        .tag.bt {
          background: ${theme.colors.warning.light};
          color: ${theme.colors.warning.main};
        }

        .tag.difficulty {
          background: ${theme.colors.success.light};
          color: ${theme.colors.success.main};
        }

        .tag.difficulty.hard {
          background: ${theme.colors.error.light};
          color: ${theme.colors.error.main};
        }

        .card-actions {
          display: flex;
          gap: 1rem;
          margin-top: auto;
        }

        .action-btn {
          background: none;
          border: none;
          padding: 0.5rem;
          cursor: pointer;
          border-radius: ${theme.borderRadius.md};
          transition: background-color 0.2s;
          font-size: 1.25rem;
        }

        .action-btn:hover {
          background: ${theme.colors.gray[100]};
        }

        .action-btn.edit:hover {
          color: ${theme.colors.primary.main};
        }

        .action-btn.delete:hover {
          color: ${theme.colors.error.main};
        }

        .loading {
          text-align: center;
          padding: 2rem;
          color: ${theme.colors.text.secondary};
        }

        .error {
          color: ${theme.colors.error.main};
          text-align: center;
          padding: 2rem;
        }
      `}</style>
    </div>
  );
} 