import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../utils/api';
import Header from '../Header';
import Logo from '../../images/profile.png';

export default function QuestionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    text: '',
    unit_id: '',
    co: '',
    bt: '',
    marks: '',
    course_id: '',
    difficulty_level: 'Medium',
    type: 'Test',
    image: null
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
    if (id) {
      fetchQuestion();
    }
  }, [id]);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/course/');
      setCourses(response.data.courses);
    } catch (error) {
      setError('Failed to fetch courses');
    }
  };

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/question/${id}/`);
      const question = response.data.question;
      if (question) {
        setFormData({
          text: question.text,
          unit_id: question.unit_id,
          co: question.co,
          bt: question.bt,
          marks: question.marks,
          course_id: question.course_id,
          difficulty_level: question.difficulty_level || 'Medium',
          type: question.type || 'Test',
          image: null
        });
      }
    } catch (error) {
      setError('Failed to fetch question details');
      console.error('Error fetching question:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) {
        formDataToSend.append(key, formData[key]);
      }
    });

    if (id) {
      formDataToSend.append('q_id', id);
    }

    try {
      const response = id
        ? await api.put(`/question/${id}/`, formDataToSend, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
        : await api.post('/question/', formDataToSend, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });

      console.log(`Question ${id ? 'updated' : 'created'} successfully:`, response.data);
      navigate('/admin/questions');
    } catch (error) {
      setError(error.response?.data?.error || `Failed to ${id ? 'update' : 'create'} question`);
      console.error(`Error ${id ? 'updating' : 'creating'} question:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="admin-form-container">
      <Header name="Admin" page={id ? 'Edit Question' : 'Add Question'} logo={Logo} />
      
      <div className="form-content">
        <h2>{id ? 'Edit Question' : 'Add New Question'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="text">Question Text</label>
            <textarea
              id="text"
              name="text"
              value={formData.text}
              onChange={handleChange}
              required
              rows={4}
            />
          </div>

          <div className="form-group">
            <label htmlFor="course_id">Course</label>
            <select
              id="course_id"
              name="course_id"
              value={formData.course_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Course</option>
              {courses.map(course => (
                <option key={course.course_id} value={course.course_id}>
                  {course.course_name} ({course.course_code})
                </option>
              ))}
            </select>
          </div>

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
              max="5"
            />
          </div>

          <div className="form-group">
            <label htmlFor="co">Course Outcome (CO)</label>
            <input
              type="text"
              id="co"
              name="co"
              value={formData.co}
              onChange={handleChange}
              required
              placeholder="e.g., 1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="bt">Bloom's Taxonomy Level (BT)</label>
            <input
              type="text"
              id="bt"
              name="bt"
              value={formData.bt}
              onChange={handleChange}
              required
              placeholder="e.g., 1"
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

          <div className="form-group">
            <label htmlFor="difficulty_level">Difficulty Level</label>
            <select
              id="difficulty_level"
              name="difficulty_level"
              value={formData.difficulty_level}
              onChange={handleChange}
              required
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="type">Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="Test">Test</option>
              <option value="Quiz">Quiz</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="image">Question Image (optional)</label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleChange}
              accept="image/*"
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate('/admin-dashboard')}
              className="cancel-button"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="submit-button"
            >
              {loading ? 'Saving...' : (id ? 'Update Question' : 'Add Question')}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .admin-form-container {
          min-height: 100vh;
          background-color: #f5f6fa;
        }

        .form-content {
          max-width: 600px;
          margin: 2rem auto;
          padding: 2rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        h2 {
          color: #417690;
          margin-bottom: 1.5rem;
        }

        .error-message {
          background: #fff1f0;
          border: 1px solid #ffa39e;
          padding: 0.75rem;
          border-radius: 4px;
          color: #cf1322;
          margin-bottom: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #2c3e50;
          font-weight: 500;
        }

        input, select, textarea {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }

        textarea {
          resize: vertical;
          min-height: 100px;
        }

        input:focus, select:focus, textarea:focus {
          border-color: #417690;
          outline: none;
          box-shadow: 0 0 0 2px rgba(65,118,144,0.2);
        }

        input[type="file"] {
          padding: 0.25rem 0;
          border: none;
          background: none;
          box-shadow: none;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }

        button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .submit-button {
          background: #417690;
          color: white;
        }

        .submit-button:hover {
          background: #205067;
        }

        .submit-button:disabled {
          background: #97a5ac;
          cursor: not-allowed;
        }

        .cancel-button {
          background: #f8f9fa;
          color: #2c3e50;
          border: 1px solid #ddd;
        }

        .cancel-button:hover {
          background: #e9ecef;
        }
      `}</style>
    </div>
  );
} 