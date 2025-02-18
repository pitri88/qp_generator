import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Logo from "../images/profile.png";
import Header from "./Header";
import { api } from '../utils/api';
import '../styles/question-paper.css';

export default function QuestionPaperForm() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [filters, setFilters] = useState({
    unit: '',
    co: '',
    bt: '',
    marks: ''
  });
  const [selectedQuestions, setSelectedQuestions] = useState({
    partA: [],
    partB: []
  });
  const [paperMetadata, setPaperMetadata] = useState({
    course_code: '',
    course_title: '',
    date: new Date().toISOString().split('T')[0],
    max_marks: '',
    duration: '',
    semester: '',
    exam_type: 'CIE'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [courseInfo, setCourseInfo] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');
      
      if (!token || userRole !== 'faculty') {
        navigate('/login-faculty');
        return;
      }

      if (!courseId) {
        navigate('/faculty-dashboard');
        return;
      }

      try {
        // First check course access
        const mappingResponse = await api.get('/faculty-courses/');
        const mappings = mappingResponse.data.mappings;
        const hasCourseAccess = mappings.some(mapping => mapping.course_id === courseId);
        
        if (!hasCourseAccess) {
          setError('You do not have access to this course');
          setTimeout(() => navigate('/faculty-dashboard'), 2000);
          return;
        }

        // Fetch course details from faculty dashboard
        const dashboardResponse = await api.get('/faculty-dashboard/');
        console.log('Dashboard response:', dashboardResponse.data); // Debug log
        
        // Extract course from the courses array
        const course = dashboardResponse.data.courses.find(c => c.id === courseId);
        
        if (course) {
          setPaperMetadata(prev => ({
            ...prev,
            course_code: course.id,
            course_title: course.name
          }));
        } else {
          console.error('Course not found in dashboard data. Available courses:', dashboardResponse.data.courses);
          throw new Error('Course not found in dashboard data');
        }
      } catch (error) {
        console.error('Error:', error);
        if (error.response?.status === 403) {
          navigate('/login-faculty');
        } else {
          setError('Failed to fetch course details. Please try again.');
          // Don't navigate away immediately to allow user to see the error
        }
      }
    };

    checkAuth();
  }, [courseId, navigate]);

  useEffect(() => {
    fetchQuestions();
  }, [courseId]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/course/${courseId}/questions/`);
      console.log('Questions response:', response.data);
      
      if (response.data && Array.isArray(response.data.questions)) {
        setQuestions(response.data.questions);
        setFilteredQuestions(response.data.questions);
        setCourseInfo(response.data.course);
      } else {
        throw new Error('Invalid questions data format');
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = async () => {
    setLoading(true);
    try {
      const filterData = {
        course_id: courseId,
        unit_numbers: filters.unit ? filters.unit.split(',').map(u => u.trim()) : [],
        cos: filters.co ? filters.co.split(',').map(co => co.trim()) : [],
        bts: filters.bt ? filters.bt.split(',').map(bt => bt.trim()) : [],
        marks: filters.marks ? filters.marks.split(',').map(m => parseInt(m.trim())).filter(m => !isNaN(m)) : []
      };

      console.log('Sending filter request:', filterData);
      const response = await api.post(`/course/${courseId}/filter-questions/`, filterData);
      
      if (response.data && response.data.questions) {
        console.log('Filtered questions:', response.data.questions);
        setFilteredQuestions(response.data.questions);
      } else {
        console.error('Invalid response format:', response.data);
        setError('Failed to filter questions');
      }
    } catch (error) {
      console.error('Error applying filters:', error);
      setError('Failed to filter questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionSelect = (questionId, part) => {
    if (!questionId) {
      console.error('No question ID provided');
      return;
    }

    console.log('Selecting question:', questionId, 'for part:', part);
    console.log('Current selected questions:', selectedQuestions);
    
    setSelectedQuestions(prev => {
      const newState = { ...prev };
      
      // If the question is already in the current part, remove it
      if (newState[part].includes(questionId)) {
        console.log('Removing question from', part);
        newState[part] = newState[part].filter(id => id !== questionId);
      } else {
        // If the question is in the other part, remove it from there
        const otherPart = part === 'partA' ? 'partB' : 'partA';
        if (newState[otherPart].includes(questionId)) {
          console.log('Moving question from', otherPart, 'to', part);
          newState[otherPart] = newState[otherPart].filter(id => id !== questionId);
        }
        
        // Add the question to the selected part
        console.log('Adding question to', part);
        newState[part] = [...newState[part], questionId];
      }
      
      console.log('New state:', newState);
      return newState;
    });
  };

  const handleMetadataChange = (e) => {
    const { name, value } = e.target;
    setPaperMetadata(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        course_id: courseId,
        course_code: paperMetadata.course_code,
        course_title: paperMetadata.course_title,
        selected_questions: {
          part_a: selectedQuestions.partA.map(id => parseInt(id)),
          part_b: selectedQuestions.partB.map(id => parseInt(id))
        },
        exam_type: paperMetadata.exam_type,
        date: paperMetadata.date,
        max_marks: parseInt(paperMetadata.max_marks),
        duration: paperMetadata.duration,
        semester: paperMetadata.semester
      };
      console.log('Submitting paper with payload:', payload);

      const response = await api.post('/generate-paper/', payload, {
        responseType: 'blob'
      });
      
      // If successful, download the file
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.setAttribute('download', `question_paper_${timestamp}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating paper:', error);
      
      // Try to get the error message from the response
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const errorData = JSON.parse(text);
          setError(errorData.error || errorData.detail || 'Failed to generate paper. Please check your selections.');
        } catch (e) {
          setError('Failed to generate paper. Please check your selections and try again.');
        }
      } else {
        setError(error.response?.data?.error || error.response?.data?.detail || 'Failed to generate paper');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filteredData) => {
    if (Array.isArray(filteredData)) {
      setFilteredQuestions(filteredData);
    } else {
      console.error('Filtered data is not an array:', filteredData);
      setFilteredQuestions([]);  // Set to empty array if invalid data
    }
  };

  if (loading) return <div className="loading">Loading questions...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!Array.isArray(filteredQuestions)) return <div className="error">Invalid questions data</div>;

  return (
    <>
      <Header name="Question Paper Form" page="Create Paper" logo={Logo} />
      <div className="paper-form">
        <h2>Create Question Paper</h2>
        {error && <div className="error-message">{error}</div>}
        
        {/* Question Filters */}
        <div className="filter-section">
          <h3>Filter Questions</h3>
          <div className="form-group">
            <label>Unit Numbers:</label>
            <input
              type="text"
              name="unit"
              value={filters.unit}
              onChange={handleFilterChange}
              placeholder="e.g., 1,2,3"
            />
          </div>
          <div className="form-group">
            <label>Course Outcomes:</label>
            <input
              type="text"
              name="co"
              value={filters.co}
              onChange={handleFilterChange}
              placeholder="e.g., 1,2,3"
            />
          </div>
          <div className="form-group">
            <label>Bloom's Taxonomy:</label>
            <input
              type="text"
              name="bt"
              value={filters.bt}
              onChange={handleFilterChange}
              placeholder="e.g., 1,2,3"
            />
          </div>
          <div className="form-group">
            <label>Marks:</label>
            <input
              type="text"
              name="marks"
              value={filters.marks}
              onChange={handleFilterChange}
              placeholder="e.g., 2,5,10"
            />
          </div>
          <button type="button" onClick={applyFilters} className="filter-button">
            Apply Filters
          </button>
        </div>

        {/* Question Selection */}
        <div className="question-selection">
          <h3>Select Questions</h3>
          <div className="questions-container">
            {filteredQuestions.map(question => {
              console.log('Rendering question:', question);
              const questionId = question.q_id || question._id || question.id;
              if (!questionId) {
                console.error('Question missing ID:', question);
                return null;
              }
              return (
                <div key={questionId} className="question-card">
                  <div className="question-text">{question.text}</div>
                  <div className="question-meta">
                    Unit: {question.unit_id} | CO: {question.co} | BT: {question.bt} | Marks: {question.marks}
                  </div>
                  <div className="question-actions">
                    <button
                      type="button"
                      className={`part-button ${selectedQuestions.partA.includes(questionId) ? 'selected' : ''}`}
                      onClick={() => {
                        console.log('Clicked Part A for question:', questionId);
                        handleQuestionSelect(questionId, 'partA');
                      }}
                    >
                      {selectedQuestions.partA.includes(questionId) ? 'Remove from Part A' : 'Add to Part A'}
                    </button>
                    <button
                      type="button"
                      className={`part-button ${selectedQuestions.partB.includes(questionId) ? 'selected' : ''}`}
                      onClick={() => {
                        console.log('Clicked Part B for question:', questionId);
                        handleQuestionSelect(questionId, 'partB');
                      }}
                    >
                      {selectedQuestions.partB.includes(questionId) ? 'Remove from Part B' : 'Add to Part B'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Paper Metadata Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Course Code:</label>
            <input
              type="text"
              name="course_code"
              value={paperMetadata.course_code}
              readOnly
              className="readonly-input"
            />
          </div>
          <div className="form-group">
            <label>Course Title:</label>
            <input
              type="text"
              name="course_title"
              value={paperMetadata.course_title}
              readOnly
              className="readonly-input"
            />
          </div>
          <div className="form-group">
            <label>Exam Type:</label>
            <select
              name="exam_type"
              value={paperMetadata.exam_type}
              onChange={handleMetadataChange}
              required
            >
              <option value="CIE">CIE</option>
              <option value="SEE">SEE</option>
              <option value="IMPROVEMENT">Improvement</option>
              <option value="MAKEUP">Makeup</option>
            </select>
          </div>
          <div className="form-group">
            <label>Date:</label>
            <input
              type="date"
              name="date"
              value={paperMetadata.date}
              onChange={handleMetadataChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Maximum Marks:</label>
            <input
              type="number"
              name="max_marks"
              value={paperMetadata.max_marks}
              onChange={handleMetadataChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Duration (e.g., "3 hours"):</label>
            <input
              type="text"
              name="duration"
              value={paperMetadata.duration}
              onChange={handleMetadataChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Semester:</label>
            <input
              type="text"
              name="semester"
              value={paperMetadata.semester}
              onChange={handleMetadataChange}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Paper'}
          </button>
        </form>

        <div className="filters-info">
          <p>Enter filter values and click "Apply Filters" to search questions.</p>
          <ul>
            <li key="unit">Unit Number: Enter a number (e.g., 1, 2, 3)</li>
            <li key="co">Course Outcome (CO): Enter the number (e.g., 1, 2, 3)</li>
            <li key="bt">Bloom's Taxonomy (BT): Enter the number (e.g., 1, 2, 3)</li>
            <li key="marks">Marks: Enter a number (e.g., 2, 5, 10)</li>
          </ul>
        </div>
      </div>
    </>
  );
}