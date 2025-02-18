import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Logo from "../images/profile.png";
import Header from "./Header";
import { api } from '../utils/api';

export default function ModifyQB() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    unit: "",
    co: "",
    bt: "",
    marks: "",
  });

  useEffect(() => {
    fetchQuestions();
  }, [courseId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/course/${courseId}/questions/`);
      setQuestions(response.data.questions || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to load questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/question/${questionId}/`);
      // Refresh the questions list after successful deletion
      await fetchQuestions();
      setError(null);
    } catch (err) {
      console.error('Error deleting question:', err);
      setError('Failed to delete question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (questionId) => {
    navigate(`/edit-question/${questionId}`);
  };

  const filteredQuestions = questions.filter(question => {
    return (!filters.unit || question.unit_id === Number(filters.unit)) &&
           (!filters.co || question.co === Number(filters.co)) &&
           (!filters.bt || question.bt === Number(filters.bt)) &&
           (!filters.marks || question.marks === Number(filters.marks));
  });

  return (
    <>
      <Header page="Modify Questions" logo={Logo}/>
      <div className="question-bank-page">
        <div className="question-bank">
          <div className="header">
            <h1>Manage Question Bank</h1>
            <button 
              className="add-question-btn" 
              onClick={() => navigate(`/manage-question-bank/${courseId}/add-questions`)}
            >
              Add Question
            </button>
          </div>
          
          <div className="filter-section">
            <input
              type="number"
              name="unit"
              value={filters.unit}
              placeholder="Unit Number"
              onChange={handleFilterChange}
              className="filter-input"
              min="1"
            />
            <input
              type="number"
              name="co"
              value={filters.co}
              placeholder="Course Outcome"
              onChange={handleFilterChange}
              className="filter-input"
              min="1"
              max="6"
            />
            <input
              type="number"
              name="bt"
              value={filters.bt}
              placeholder="BT Level"
              onChange={handleFilterChange}
              className="filter-input"
              min="1"
              max="6"
            />
            <input
              type="number"
              name="marks"
              value={filters.marks}
              placeholder="Marks"
              onChange={handleFilterChange}
              className="filter-input"
              min="1"
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {loading ? (
            <div className="loading">Loading questions...</div>
          ) : (
            <div className="question-list">
              {filteredQuestions.length === 0 ? (
                <div className="no-questions">
                  No questions match the selected filters
                </div>
              ) : (
                filteredQuestions.map(question => (
                  <div key={question.q_id} className="question-item">
                    <div className="question-info">
                      <span className="question-text">{question.text}</span>
                      <div className="question-meta">
                        <span className="meta-item">Unit {question.unit_id}</span>
                        <span className="meta-item">CO {question.co}</span>
                        <span className="meta-item">BT {question.bt}</span>
                        <span className="meta-item">{question.marks} marks</span>
                      </div>
                    </div>
                    <div className="question-actions">
                      <button 
                        className="modify-btn" 
                        title="Modify Question"
                        onClick={() => handleEdit(question.q_id)}
                      >
                        ✏️
                      </button>
                      <button 
                        className="delete-btn" 
                        title="Delete Question"
                        onClick={() => handleDelete(question.q_id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .question-bank-page {
          padding: 2rem;
        }

        .question-bank {
          max-width: 1200px;
          margin: 0 auto;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .add-question-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .add-question-btn:hover {
          background: #0056b3;
        }

        .filter-section {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .filter-input {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          flex: 1;
          min-width: 150px;
        }

        .filter-input:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }

        .question-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .question-item {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .question-info {
          flex: 1;
        }

        .question-text {
          display: block;
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
          color: #2c3e50;
        }

        .question-meta {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .meta-item {
          background: #f8f9fa;
          padding: 0.25rem 0.75rem;
          border-radius: 100px;
          font-size: 0.875rem;
          color: #6c757d;
        }

        .question-actions {
          display: flex;
          gap: 0.5rem;
        }

        .modify-btn,
        .delete-btn {
          background: none;
          border: none;
          font-size: 1.25rem;
          padding: 0.5rem;
          cursor: pointer;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .modify-btn:hover,
        .delete-btn:hover {
          background: #f8f9fa;
        }

        .error-message {
          color: #dc3545;
          padding: 1rem;
          background: #f8d7da;
          border-radius: 4px;
          margin-bottom: 1rem;
        }

        .loading,
        .no-questions {
          text-align: center;
          padding: 2rem;
          color: #6c757d;
        }
      `}</style>
    </>
  );
}
