import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import Header from './Header';
import Logo from '../images/profile.png';

export default function CourseView() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [courseDetails, setCourseDetails] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    unit_id: '',
    co: '',
    bt: '',
    marks: ''
  });

  useEffect(() => {
    // Check authentication on mount
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token || userRole !== 'faculty') {
      navigate('/login-faculty');
      return;
    }

    fetchCourseDetails();
    // Initial fetch of all questions
    const fetchInitialQuestions = async () => {
      try {
        const response = await api.post('/filter-questions/', {
          course_id: courseId,
          unit_numbers: [],
          cos: [],
          bts: [],
          marks: []
        });
        setQuestions(response.data.questions || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching initial questions:', error);
        setError('Failed to load questions. Please try again.');
        setLoading(false);
      }
    };
    fetchInitialQuestions();
  }, [courseId, navigate]);

  const fetchCourseDetails = async () => {
    try {
      const response = await api.get(`/course/${courseId}/`);
      setCourseDetails(response.data);
    } catch (error) {
      console.error('Error fetching course details:', error);
      setError('Failed to load course details');
    }
  };

  const fetchQuestions = async () => {
    try {
      // Only include non-empty filters and convert numeric values
      const filterParams = {
        course_id: courseId,
        unit_numbers: filters.unit_id ? [Number(filters.unit_id)] : [],
        cos: filters.co ? [filters.co] : [],
        bts: filters.bt ? [filters.bt] : [],
        marks: filters.marks ? [Number(filters.marks)] : []
      };

      console.log('Sending filter params:', filterParams);
      const response = await api.post('/filter-questions/', filterParams);
      console.log('Filter response:', response.data);
      setQuestions(response.data.questions || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching questions:', error.response?.data || error);
      setError('Failed to load questions. Please try again.');
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    console.log(`Filter changed: ${name} = ${value}`);
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = async () => {
    console.log('Applying filters:', filters);
    setLoading(true);
    setError(null);
    try {
      const filterParams = {
        course_id: courseId,
        unit_numbers: filters.unit_id ? [Number(filters.unit_id)] : [],
        cos: filters.co ? [filters.co] : [], // Send as string
        bts: filters.bt ? [filters.bt] : [], // Send as string
        marks: filters.marks ? [Number(filters.marks)] : []
      };

      console.log('Sending filter params:', filterParams);
      const response = await api.post('/filter-questions/', filterParams);
      console.log('Filter response:', response.data);
      setQuestions(response.data.questions || []);
    } catch (error) {
      console.error('Error applying filters:', error.response?.data || error);
      setError('Failed to filter questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = async () => {
    console.log('Resetting filters');
    setFilters({
      unit_id: '',
      co: '',
      bt: '',
      marks: ''
    });
    setLoading(true);
    try {
      const response = await api.post('/filter-questions/', {
        course_id: courseId,
        unit_numbers: [],
        cos: [],
        bts: [],
        marks: []
      });
      console.log('Reset response:', response.data);
      setQuestions(response.data.questions || []);
    } catch (error) {
      console.error('Error resetting filters:', error.response?.data || error);
      setError('Failed to reset filters. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestionPaper = () => {
    navigate(`/create-question-paper/${courseId}`);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <>
      <Header name="Course View" page={courseDetails?.name || 'Course'} logo={Logo} />
      <div className="course-view">
        {courseDetails && (
          <div className="course-header">
            <h1>{courseDetails.name}</h1>
            <p>{courseDetails.description}</p>
          </div>
        )}

        <div className="filters-section">
          <h3>Filter Questions</h3>
          <div className="filters-info">
            <p>Enter filter values and click "Apply Filters" to search questions.</p>
            <ul>
              <li>Unit Number: Enter a number (e.g., 1, 2, 3)</li>
              <li>Course Outcome (CO): Enter the number (e.g., 1, 2, 3)</li>
              <li>Bloom's Taxonomy (BT): Enter the number (e.g., 1, 2, 3)</li>
              <li>Marks: Enter a number (e.g., 2, 5, 10)</li>
            </ul>
          </div>
          <div className="filters-grid">
            <div className="filter-input">
              <label htmlFor="unit_id">Unit Number:</label>
              <input
                id="unit_id"
                type="number"
                name="unit_id"
                placeholder="e.g., 1"
                value={filters.unit_id}
                onChange={handleFilterChange}
                min="1"
              />
            </div>
            <div className="filter-input">
              <label htmlFor="co">Course Outcome (CO):</label>
              <input
                id="co"
                type="text"
                name="co"
                placeholder="e.g., 1"
                value={filters.co}
                onChange={handleFilterChange}
                maxLength="1"
              />
            </div>
            <div className="filter-input">
              <label htmlFor="bt">Bloom's Taxonomy (BT):</label>
              <input
                id="bt"
                type="text"
                name="bt"
                placeholder="e.g., 1"
                value={filters.bt}
                onChange={handleFilterChange}
                maxLength="1"
              />
            </div>
            <div className="filter-input">
              <label htmlFor="marks">Marks:</label>
              <input
                id="marks"
                type="number"
                name="marks"
                placeholder="e.g., 5"
                value={filters.marks}
                onChange={handleFilterChange}
                min="0"
              />
            </div>
          </div>
          <div className="filter-actions">
            <button onClick={applyFilters} disabled={loading}>
              {loading ? 'Filtering...' : 'Apply Filters'}
            </button>
            <button onClick={resetFilters} disabled={loading}>
              Reset Filters
            </button>
          </div>
        </div>

        <div className="questions-section">
          <div className="questions-header">
            <h2>Question Bank</h2>
            <button onClick={handleCreateQuestionPaper}>
              Create Question Paper
            </button>
          </div>

          <div className="questions-grid">
            {questions.map((question) => (
              <div key={question.id} className="question-card">
                <div className="question-text">{question.text}</div>
                <div className="question-details">
                  <span>Unit: {question.unit}</span>
                  <span>CO: {question.co}</span>
                  <span>BT: {question.bt}</span>
                  <span>Marks: {question.marks}</span>
                </div>
                {question.image_paths && (
                  <div className="question-media">
                    <img src={question.image_paths} alt="Question" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {questions.length === 0 && (
            <p className="no-questions">No questions found. Add some questions to get started!</p>
          )}
        </div>
      </div>

      <style jsx>{`
        .course-view {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .course-header {
          margin-bottom: 30px;
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .course-header h1 {
          margin: 0;
          color: #2c3e50;
        }

        .filters-section {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }

        .filters-info {
          margin-bottom: 20px;
          padding: 10px;
          background-color: #f8f9fa;
          border-radius: 4px;
        }

        .filters-info ul {
          margin: 10px 0 0 20px;
          padding: 0;
        }

        .filters-info li {
          margin-bottom: 5px;
          color: #666;
        }

        .filter-input {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .filter-input label {
          font-size: 0.9em;
          color: #666;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 15px;
        }

        .filters-grid input {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          width: 100%;
        }

        .filters-grid input:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }

        .filter-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .filter-actions button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          background-color: #3498db;
          color: white;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .filter-actions button:hover {
          background-color: #2980b9;
        }

        .filter-actions button:disabled {
          background-color: #bdc3c7;
          cursor: not-allowed;
        }

        .filter-actions button:last-child {
          background-color: #95a5a6;
        }

        .filter-actions button:last-child:hover {
          background-color: #7f8c8d;
        }

        .questions-section {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .questions-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .questions-header button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          background-color: #2ecc71;
          color: white;
          cursor: pointer;
        }

        .questions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .question-card {
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: #f9f9f9;
        }

        .question-text {
          margin-bottom: 10px;
          font-size: 1.1em;
        }

        .question-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          font-size: 0.9em;
          color: #666;
        }

        .question-media {
          margin-top: 10px;
        }

        .question-media img {
          max-width: 100%;
          border-radius: 4px;
        }

        .no-questions {
          text-align: center;
          color: #666;
          margin-top: 20px;
        }

        .loading, .error-message {
          text-align: center;
          margin-top: 40px;
          font-size: 1.2em;
        }

        .error-message {
          color: #e74c3c;
        }
      `}</style>
    </>
  );
} 