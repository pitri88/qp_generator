import React, { useState } from 'react';
import Logo from "../images/profile.png"
import Header from "./Header"
import { useNavigate } from 'react-router-dom';

export default function ModifyQB() {
  
  const navigate = useNavigate();
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    marks: '',
    co: '',
    unit: '',
    image: null,
  });

  
  const [filters, setFilters] = useState({
    unit: "",
    co: "",
    bt: "",
    marks: "",
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleNavigation = () => {
    navigate("./add-questions");
  };

  return (
    <>
      <Header page = "Modify Questions" logo={Logo}/>
      <div className="question-bank-page">
        <div className="question-bank">
          <div className="header">
            <h1>Manage Question Bank</h1>
            <button className="add-question-btn" onClick={() => handleNavigation()}>Add Question</button>
          </div>
          
          <div className="filter-section">
            <br />
            <input
              type="number"
              name="unit"
              value={filters.unit}
              placeholder="Unit Number"
              onChange={handleFilterChange}
              className="filter-input"
            />
            <input
              type="number"
              name="co"
              value={filters.co}
              placeholder="Course Outcome"
              onChange={handleFilterChange}
              className="filter-input"
            />
            <input
              type="number"
              name="bt"
              value={filters.bt}
              placeholder="BT"
              onChange={handleFilterChange}
              className="filter-input"
            />
            <input
              type="number"
              name="marks"
              value={filters.marks}
              placeholder="Marks"
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>
          <div className="question-list">
            <div className="question-item">
              <span className="question-text">Sample Question 1</span>
              <div className="question-actions">
                <button className="modify-btn" title="Modify Question">✏️</button>
                <button className="delete-btn" title="Delete Question">🗑️</button>
              </div>
            </div>
            <div className="question-item">
              <span className="question-text">Sample Question 2</span>
              <div className="question-actions">
                <button className="modify-btn" title="Modify Question">✏️</button>
                <button className="delete-btn" title="Delete Question">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
