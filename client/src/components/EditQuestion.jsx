import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../utils/api';
import Header from './Header';
import Logo from '../images/profile.png';

export default function EditQuestion() {
  const navigate = useNavigate();
  const { questionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    text: '',
    unit_id: '',
    co: '',
    bt: '',
    marks: '',
    difficulty_level: 'Medium',
    type: 'Test'
  });

  useEffect(() => {
    fetchQuestion();
  }, [questionId]);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/question/${questionId}/`);
      const question = response.data.question;
      
      setFormData({
        text: question.text || '',
        unit_id: parseInt(question.unit_id) || '',
        co: question.co || '',
        bt: question.bt || '',
        marks: question.marks || '',
        difficulty_level: question.difficulty_level || 'Medium',
        type: question.type || 'Test'
      });
    } catch (err) {
      console.error('Error fetching question:', err);
      setError(err.response?.data?.error || 'Failed to load question details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'unit_id' || name === 'marks' ? 
        (value === '' ? '' : parseInt(value)) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const submitData = {
        ...formData,
        unit_id: formData.unit_id.toString()
      };
      
      await api.put(`/question/${questionId}/`, submitData);
      navigate(-1); // Go back to previous page after successful update
    } catch (err) {
      console.error('Error updating question:', err);
      setError(err.response?.data?.error || 'Failed to update question');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header page="Edit Question" logo={Logo} />
        <div className="loading">Loading question details...</div>
      </>
    );
  }

  return (
    <>
      <Header page="Edit Question" logo={Logo} />
      <div className="edit-question-page">
        <div className="edit-question-container">
          <h1>Edit Question</h1>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="text">Question Text</label>
              <textarea
                id="text"
                name="text"
                value={formData.text}
                onChange={handleChange}
                required
                rows="4"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="unit_id">Unit Number</label>
                <input
                  type="number"
                  id="unit_id"
                  name="unit_id"
                  value={formData.unit_id}
                  onChange={handleChange}
                  required
                  min="1"
                />
              </div>

              <div className="form-group">
                <label htmlFor="co">Course Outcome</label>
                <input
                  type="number"
                  id="co"
                  name="co"
                  value={formData.co}
                  onChange={handleChange}
                  required
                  min="1"
                  max="6"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="bt">BT Level</label>
                <input
                  type="number"
                  id="bt"
                  name="bt"
                  value={formData.bt}
                  onChange={handleChange}
                  required
                  min="1"
                  max="6"
                />
              </div>

              <div className="form-group">
                <label htmlFor="marks">Marks</label>
                <input
                  type="number"
                  id="marks"
                  name="marks"
                  value={formData.marks}
                  onChange={handleChange}
                  required
                  min="1"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="difficulty_level">Difficulty Level</label>
                <select
                  id="difficulty_level"
                  name="difficulty_level"
                  value={formData.difficulty_level}
                  onChange={handleChange}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="type">Question Type</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="Test">Test</option>
                  <option value="Quiz">Quiz</option>
                  <option value="Assignment">Assignment</option>
                </select>
              </div>
            </div>

            <div className="button-group">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="save-btn"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .edit-question-page {
          padding: 2rem;
        }

        .edit-question-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        h1 {
          margin-bottom: 2rem;
          color: #2c3e50;
        }

        .error-message {
          background: #f8d7da;
          color: #dc3545;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
          flex: 1;
        }

        .form-row {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #4a5568;
          font-weight: 500;
        }

        input,
        textarea,
        select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-size: 1rem;
        }

        input:focus,
        textarea:focus,
        select:focus {
          outline: none;
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
        }

        textarea {
          resize: vertical;
          min-height: 100px;
        }

        .button-group {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        button {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .cancel-btn {
          background: #e2e8f0;
          color: #4a5568;
        }

        .cancel-btn:hover {
          background: #cbd5e0;
        }

        .save-btn {
          background: #4299e1;
          color: white;
        }

        .save-btn:hover:not(:disabled) {
          background: #3182ce;
        }

        .loading {
          text-align: center;
          padding: 2rem;
          color: #4a5568;
        }
      `}</style>
    </>
  );
}
