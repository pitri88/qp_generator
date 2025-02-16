import React, { useState } from 'react';
import { api } from '../utils/api';
import QuestionFilter from './QuestionFilter';
import '../styles/paper_generator.css';

export default function PaperGenerator() {
    const [filteredQuestions, setFilteredQuestions] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [paperMetadata, setPaperMetadata] = useState({
        course_code: '',
        course_title: '',
        date: '',
        max_marks: '',
        duration: '',
        semester: '',
        is_improvement_cie: false
    });
    const [loading, setLoading] = useState(false);

    const handleMetadataChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPaperMetadata(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleQuestionSelect = (question, part) => {
        setSelectedQuestions(prev => {
            const isAlreadySelected = prev.some(q => q.question_id === question.id);
            if (isAlreadySelected) {
                return prev.filter(q => q.question_id !== question.id);
            }
            return [...prev, { question_id: question.id, part }];
        });
    };

    const handleGeneratePaper = async (e) => {
        e.preventDefault();
        if (selectedQuestions.length === 0) {
            alert('Please select at least one question');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/generate-paper/', {
                ...paperMetadata,
                selected_questions: selectedQuestions
            }, { responseType: 'blob' });

            // Create a download link for the file
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            link.setAttribute('download', `question_paper_${timestamp}.docx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error generating paper:', error);
            alert('Failed to generate paper. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="paper-generator">
            <h1>Question Paper Generator</h1>
            
            {/* Question Filter Section */}
            <section className="filter-section">
                <QuestionFilter onQuestionsFiltered={setFilteredQuestions} />
            </section>

            {/* Question Selection Section */}
            <section className="selection-section">
                <h2>Select Questions</h2>
                <div className="questions-grid">
                    {filteredQuestions.map(question => (
                        <div key={question.id} className="question-card">
                            <p>{question.text}</p>
                            <div className="question-details">
                                <span>Marks: {question.marks}</span>
                                <span>CO: {question.co}</span>
                                <span>BT: {question.bt}</span>
                                <span>Unit: {question.unit}</span>
                            </div>
                            <div className="question-actions">
                                <button 
                                    onClick={() => handleQuestionSelect(question, 'A')}
                                    className={selectedQuestions.some(q => q.question_id === question.id && q.part === 'A') ? 'selected' : ''}
                                >
                                    Part A
                                </button>
                                <button 
                                    onClick={() => handleQuestionSelect(question, 'B')}
                                    className={selectedQuestions.some(q => q.question_id === question.id && q.part === 'B') ? 'selected' : ''}
                                >
                                    Part B
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Paper Metadata Section */}
            <section className="metadata-section">
                <h2>Paper Details</h2>
                <form onSubmit={handleGeneratePaper}>
                    <div className="form-group">
                        <label>Course Code:</label>
                        <input
                            type="text"
                            name="course_code"
                            value={paperMetadata.course_code}
                            onChange={handleMetadataChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Course Title:</label>
                        <input
                            type="text"
                            name="course_title"
                            value={paperMetadata.course_title}
                            onChange={handleMetadataChange}
                            required
                        />
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
                        <label>Duration:</label>
                        <input
                            type="text"
                            name="duration"
                            value={paperMetadata.duration}
                            onChange={handleMetadataChange}
                            placeholder="e.g., 3 hours"
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
                    <div className="form-group">
                        <label>
                            <input
                                type="checkbox"
                                name="is_improvement_cie"
                                checked={paperMetadata.is_improvement_cie}
                                onChange={handleMetadataChange}
                            />
                            Improvement CIE
                        </label>
                    </div>
                    <button type="submit" disabled={loading || selectedQuestions.length === 0}>
                        {loading ? 'Generating Paper...' : 'Generate Paper'}
                    </button>
                </form>
            </section>
        </div>
    );
} 