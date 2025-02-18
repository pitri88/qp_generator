import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from '../utils/api';
import Logo from "../images/profile.png";
import Header from "./Header";

// Function to get CSRF token from cookies
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Add request interceptor to add auth token and CSRF token
api.interceptors.request.use(
  (config) => {
    // Add auth token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }

    // Add CSRF token
    const csrfToken = getCookie('csrftoken');
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }

    // For multipart/form-data, let the browser set the Content-Type and boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Response Error:', error.response?.data);
    if (error.response) {
      const status = error.response.status;
      const errorMessage = error.response.data?.error || error.response.data?.detail || 'An error occurred';
      
      if (status === 403) {
        console.log('403 Error:', errorMessage);
        if (errorMessage.includes('CSRF')) {
          // CSRF error - try to refresh the page to get a new token
          alert('Session expired. Please refresh the page and try again.');
          return Promise.reject(error);
        } else if (errorMessage.includes('permission') || errorMessage.includes('course')) {
          // Course permission error
          alert(errorMessage);
          window.location.href = '/faculty-dashboard';
        } else {
          // Authentication error
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          window.location.href = '/login-faculty';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default function AddQuestion() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState("manual");
  const [manualData, setManualData] = useState({
    text: "",
    marks: "",
    unit: "",
    co: "",
    bt: "",
    image: null,
    equationFile: null,
  });
  const [wordFile, setWordFile] = useState(null);

  // Check authentication and role on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    if (!token || userRole !== 'faculty') {
      navigate('/login-faculty');
      return;
    }
    if (!courseId) {
      navigate('/faculty-dashboard');
    }
  }, [courseId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setManualData({ ...manualData, [name]: value });
  };

  function uploadPaper(e) {
    e.preventDefault();
    if (!wordFile) {
      alert('Please select a file first!');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in again.');
      navigate('/login-faculty');
      return;
    }

    const formData = new FormData();
    formData.append('file', wordFile);
    formData.append('course_id', courseId);

    api.post('/upload-question/', formData)
      .then(response => {
        console.log('Success:', response);
        alert('File uploaded successfully!');
        setWordFile(null);
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
      })
      .catch(error => {
        console.error('Upload Error:', error.response?.data);
        if (error.response) {
          const errorMessage = error.response.data?.error || 'Server error occurred';
          alert(errorMessage);
          if (error.response.status === 403) {
            if (errorMessage.includes('permission') || errorMessage.includes('course')) {
              navigate('/faculty-dashboard');
            } else {
              navigate('/login-faculty');
            }
          }
        } else if (error.request) {
          alert('Network Error: Could not reach the server. Please check if the server is running.');
        } else {
          alert('Error: ' + error.message);
        }
      });
  }

  const handleFileChange = (e) => {
    const { name } = e.target;
    setManualData({ ...manualData, [name]: e.target.files[0] });
  };

  const handleWordFileChange = (e) => {
    setWordFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('course_id', courseId);

    if (mode === "manual") {
      formData.append("text", manualData.text);
      formData.append("marks", manualData.marks);
      formData.append("unit", manualData.unit);
      formData.append("co", manualData.co);
      formData.append("bt", manualData.bt);
      if (manualData.image) formData.append("image", manualData.image);
      if (manualData.equationFile) formData.append("equationFile", manualData.equationFile);
    }

    try {
      const response = await api.post("/add-question/", formData);
      console.log('Success:', response);
      alert("Question added successfully!");
      // Reset form
      setManualData({
        text: "",
        marks: "",
        unit: "",
        co: "",
        bt: "",
        image: null,
        equationFile: null,
      });
    } catch (error) {
      console.error("Error adding question:", error);
      if (error.response) {
        alert("Server Error: " + (error.response.data?.error || error.response.statusText));
      } else if (error.request) {
        alert("Network Error: Could not reach the server. Please check if the server is running.");
      } else {
        alert("Error: " + error.message);
      }
    }
  };

  return (
    <>
      <Header name="AAA" page="Add Question" logo={Logo} />
      <div className="add-question-page">
        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === "manual" ? "active" : ""}`}
            onClick={() => setMode("manual")}
          >
            Manual Input
          </button>
          <button
            className={`mode-btn ${mode === "upload" ? "active" : ""}`}
            onClick={() => setMode("upload")}
          >
            Upload Word Document
          </button>
        </div>

        {mode === "upload" ? (
          <form className="upload-form" onSubmit={uploadPaper}>
            <input
              type="file"
              accept=".doc,.docx"
              onChange={handleWordFileChange}
              required
            />
            <button type="submit">Upload</button>
          </form>
        ) : (
          <form className="add-question-form" onSubmit={handleSubmit}>
            <textarea
              name="text"
              placeholder="Enter Question Text"
              value={manualData.text}
              onChange={handleChange}
              required
            />
            <input
              type="number"
              name="marks"
              placeholder="Marks"
              value={manualData.marks}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="unit"
              placeholder="Unit"
              value={manualData.unit}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="co"
              placeholder="Course Outcome (CO)"
              value={manualData.co}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="bt"
              placeholder="Bloom's Taxonomy Level"
              value={manualData.bt}
              onChange={handleChange}
              required
            />
            <div className="file-inputs">
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleFileChange}
              />
              <input
                type="file"
                name="equationFile"
                accept=".tex,.latex"
                onChange={handleFileChange}
              />
            </div>
            <button type="submit">Add Question</button>
          </form>
        )}
      </div>
    </>
  );
}
