import React, { useState, useEffect } from 'react';

const StudentBehaviourForm = ({ studentId, termId, onSave, initialData = {} }) => {
  const [formData, setFormData] = useState({
    conduct: 'GOOD',
    attitude: 'GOOD', 
    interest: 'VARIED_INTERESTS',
    class_teacher_remarks: '',
    ...initialData
  });
  
  const [choices, setChoices] = useState({
    conduct_choices: [],
    attitude_choices: [],
    interest_choices: [],
    teacher_remarks_templates: []
  });
  
  const [loading, setLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    fetchChoices();
  }, []);

  const fetchChoices = async () => {
    try {
      const response = await fetch('/api/students/behaviour/choices/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setChoices(data);
    } catch (error) {
      console.error('Error fetching choices:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTemplateSelect = (template) => {
    setFormData(prev => ({
      ...prev,
      class_teacher_remarks: template
    }));
    setShowTemplates(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = initialData.id 
        ? `/api/students/behaviour/${initialData.id}/`
        : '/api/students/behaviour/';
      
      const method = initialData.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          student: studentId,
          term: termId
        })
      });

      if (response.ok) {
        const result = await response.json();
        onSave?.(result);
      } else {
        throw new Error('Failed to save behaviour data');
      }
    } catch (error) {
      console.error('Error saving behaviour:', error);
      alert('Error saving behaviour data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-behaviour-form">
      <h3>Student Behaviour & Conduct</h3>
      
      <form onSubmit={handleSubmit} className="behaviour-form">
        <div className="form-row">
          <div className="form-group">
            <label>Conduct:</label>
            <select 
              value={formData.conduct}
              onChange={(e) => handleChange('conduct', e.target.value)}
              required
            >
              {choices.conduct_choices.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Attitude:</label>
            <select 
              value={formData.attitude}
              onChange={(e) => handleChange('attitude', e.target.value)}
              required
            >
              {choices.attitude_choices.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Interest:</label>
            <input
              type="text"
              list="interest-choices"
              placeholder="Select or type interest..."
              value={formData.interest}
              onChange={(e) => handleChange('interest', e.target.value)}
              required
            />
            <datalist id="interest-choices">
              <option value="Reading" />
              <option value="Writing" />
              <option value="Mathematics" />
              <option value="Science" />
              <option value="Sports" />
              <option value="Dancing" />
              <option value="Drama" />
              <option value="Music" />
              <option value="Art" />
              <option value="Technology" />
              <option value="Languages" />
              <option value="History" />
              <option value="Geography" />
              <option value="Social Studies" />
              <option value="Varied Interests" />
            </datalist>
          </div>
        </div>

        <div className="form-group">
          <label>Class Teacher's Remarks:</label>
          <div className="remarks-section">
            <button 
              type="button" 
              className="template-btn"
              onClick={() => setShowTemplates(!showTemplates)}
            >
              📝 Use Template
            </button>
            
            {showTemplates && (
              <div className="templates-dropdown">
                <h4>Select a template:</h4>
                {choices.teacher_remarks_templates.map((template, index) => (
                  <div 
                    key={index}
                    className="template-option"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    {template.substring(0, 80)}...
                  </div>
                ))}
              </div>
            )}
            
            <textarea
              value={formData.class_teacher_remarks}
              onChange={(e) => handleChange('class_teacher_remarks', e.target.value)}
              placeholder="Enter teacher's remarks about the student..."
              rows={4}
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="save-btn">
            {loading ? 'Saving...' : 'Save Behaviour Data'}
          </button>
        </div>
      </form>

      <style jsx>{`
        .student-behaviour-form {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin: 20px 0;
        }

        .behaviour-form {
          max-width: 800px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-weight: bold;
          margin-bottom: 5px;
          color: #333;
        }

        .form-group select,
        .form-group textarea {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
        }

        .remarks-section {
          position: relative;
        }

        .template-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          margin-bottom: 10px;
          font-size: 14px;
        }

        .template-btn:hover {
          background: #218838;
        }

        .templates-dropdown {
          position: absolute;
          top: 40px;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          z-index: 1000;
          max-height: 300px;
          overflow-y: auto;
        }

        .templates-dropdown h4 {
          margin: 0;
          padding: 10px;
          background: #f8f9fa;
          border-bottom: 1px solid #ddd;
          font-size: 14px;
        }

        .template-option {
          padding: 10px;
          cursor: pointer;
          border-bottom: 1px solid #eee;
          font-size: 13px;
          line-height: 1.4;
        }

        .template-option:hover {
          background: #f8f9fa;
        }

        .template-option:last-child {
          border-bottom: none;
        }

        .form-actions {
          margin-top: 20px;
          text-align: right;
        }

        .save-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
        }

        .save-btn:hover:not(:disabled) {
          background: #0056b3;
        }

        .save-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
            gap: 15px;
          }
          
          .templates-dropdown {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90%;
            max-width: 400px;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentBehaviourForm;