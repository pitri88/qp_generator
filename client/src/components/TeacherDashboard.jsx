import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Logo from '../images/profile.png';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { api } from '../utils/api';
import '../styles/dashboard.css';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check authentication on mount
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token || userRole !== 'faculty') {
      navigate('/login-faculty');
      return;
    }

    // Fetch courses
    fetchCourses();
  }, [navigate]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/faculty-dashboard/');
      localStorage.setItem('name', response.data.name);
      console.log('API Response:', response.data); // Debug log
      if (response.data.courses && response.data.courses.length > 0) {
        setCourses(response.data.courses);
      } else {
        setError('No courses found.');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      if (error.response?.status === 403) {
        // Forbidden - likely a role/permission issue
        navigate('/login-faculty');
      } else {
        setError('Failed to load courses. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (courseId, action) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token || userRole !== 'faculty') {
      navigate('/login-faculty');
      return;
    }

    if (action === 'manage') {
      navigate(`/manage-question-bank/${courseId}`);
    } else if (action === 'create') {
      navigate(`/create-question-paper/${courseId}`);
    }
  };

  if (loading) {
    return (
      <>
        <Header name={localStorage.getItem('name')} page="Dashboard" logo={Logo} />
        <div className="dashboard-page">
          <div className="loading">Loading courses...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header name={localStorage.getItem('name')} page="Dashboard" logo={Logo} />
      <div className="dashboard-page">
        <div className="dashboard">
          <h1>Teacher Dashboard</h1>
          {error && <div className="error-message">{error}</div>}
          <div className="course-list">
            {courses.map((course) => (
              <Accordion key={course.id}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`panel-${course.id}-content`} id={`panel-${course.id}-header`}>
                  <div className="course-name">{course.name}</div>
                </AccordionSummary>
                <AccordionDetails>
                  <div>
                    <div className="dropdown">
                      <button onClick={() => handleNavigation(course.id, 'manage')}>Manage Question Bank</button>
                      <button onClick={() => handleNavigation(course.id, 'create')}>Create Question Paper</button>
                    </div>
                    <ul className="unit-list">
                      {course.units?.map((unit, index) => (
                        <li key={index} className="unit-item">{unit}</li>
                      ))}
                    </ul>
                  </div>
                </AccordionDetails>
              </Accordion>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
