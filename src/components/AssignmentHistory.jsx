import React, { useState } from 'react';
import { FaHistory, FaEye, FaStar, FaCalendar, FaFileAlt } from 'react-icons/fa';

const AssignmentHistory = ({ completedAssignments }) => {
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const getGradeColor = (grade) => {
    if (grade >= 80) return '#10b981';
    if (grade >= 70) return '#3b82f6';
    if (grade >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const viewAssignmentDetails = (assignment) => {
    setSelectedAssignment(assignment);
  };

  if (completedAssignments.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px',
        color: '#64748b'
      }}>
        <FaHistory size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
        <p>No completed assignments yet</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        marginBottom: '20px',
        fontSize: '20px',
        fontWeight: '600'
      }}>
        <FaHistory />
        Assignment History
      </h2>

      <div style={{ display: 'grid', gap: '16px' }}>
        {completedAssignments.map(assignment => (
          <div
            key={assignment.id}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '600' }}>
                  {assignment.title}
                </h3>
                
                <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FaCalendar size={12} />
                    Submitted: {new Date(assignment.submitted_at).toLocaleDateString()}
                  </span>
                </div>

                {assignment.grade !== null && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      background: `${getGradeColor(assignment.grade)}20`,
                      color: getGradeColor(assignment.grade),
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <FaStar size={12} />
                      Grade: {assignment.grade}%
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => viewAssignmentDetails(assignment)}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FaEye size={12} />
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Assignment Details Modal */}
      {selectedAssignment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                {selectedAssignment.title}
              </h2>
              <button
                onClick={() => setSelectedAssignment(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ color: '#64748b', marginBottom: '16px' }}>
                {selectedAssignment.description}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>DUE DATE</span>
                  <p style={{ margin: '4px 0 0', fontWeight: '600' }}>
                    {new Date(selectedAssignment.due_date).toLocaleDateString()}
                  </p>
                </div>
                
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>SUBMITTED</span>
                  <p style={{ margin: '4px 0 0', fontWeight: '600' }}>
                    {new Date(selectedAssignment.submitted_at).toLocaleDateString()}
                  </p>
                </div>

                {selectedAssignment.grade !== null && (
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>GRADE</span>
                    <p style={{ 
                      margin: '4px 0 0', 
                      fontWeight: '700', 
                      fontSize: '18px',
                      color: getGradeColor(selectedAssignment.grade)
                    }}>
                      {selectedAssignment.grade}%
                    </p>
                  </div>
                )}
              </div>

              {selectedAssignment.feedback && (
                <div style={{
                  background: '#f8fafc',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    Teacher Feedback:
                  </h4>
                  <p style={{ margin: 0, color: '#64748b', lineHeight: 1.5 }}>
                    {selectedAssignment.feedback}
                  </p>
                </div>
              )}

              {selectedAssignment.submission && (
                <div style={{
                  background: '#f8fafc',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  marginTop: '16px'
                }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '600', color: '#374151', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaFileAlt size={12} />
                    Your Submission:
                  </h4>
                  <p style={{ margin: 0, color: '#64748b', lineHeight: 1.5 }}>
                    {selectedAssignment.submission}
                  </p>
                </div>
              )}
            </div>

            <div style={{
              background: '#fffbeb',
              border: '1px solid #fbbf24',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '14px',
              color: '#92400e'
            }}>
              <strong>Note:</strong> This assignment is completed and cannot be retaken. 
              This view is for reference purposes only.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentHistory;