import React, { useState } from 'react';
import { api } from '../utils/api';

export default function QuestionFilter({ onQuestionsFiltered }) {
    const [filterCriteria, setFilterCriteria] = useState({
        unit_numbers: [],
        cos: [],
        bts: [],
        marks: []
    });

    const [loading, setLoading] = useState(false);

    const handleInputChange = (field, value) => {
        // Convert comma-separated string to array and clean up values
        const values = value.split(',').map(v => v.trim()).filter(v => v);
        setFilterCriteria(prev => ({
            ...prev,
            [field]: values
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/filter-questions/', filterCriteria);
            onQuestionsFiltered(response.data.questions);
        } catch (error) {
            console.error('Error filtering questions:', error);
            alert('Failed to filter questions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="question-filter">
            <h2>Filter Questions</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Unit Numbers (comma-separated):</label>
                    <input
                        type="text"
                        onChange={(e) => handleInputChange('unit_numbers', e.target.value)}
                        placeholder="e.g., 1,2,3"
                    />
                </div>
                <div className="form-group">
                    <label>Course Outcomes (comma-separated):</label>
                    <input
                        type="text"
                        onChange={(e) => handleInputChange('cos', e.target.value)}
                        placeholder="e.g., CO1,CO2,CO3"
                    />
                </div>
                <div className="form-group">
                    <label>Bloom's Taxonomy (comma-separated):</label>
                    <input
                        type="text"
                        onChange={(e) => handleInputChange('bts', e.target.value)}
                        placeholder="e.g., BT1,BT2,BT3"
                    />
                </div>
                <div className="form-group">
                    <label>Marks (comma-separated):</label>
                    <input
                        type="text"
                        onChange={(e) => handleInputChange('marks', e.target.value)}
                        placeholder="e.g., 2,5,10"
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Filtering...' : 'Filter Questions'}
                </button>
            </form>
        </div>
    );
} 