import React, { useState } from 'react';
import AssignmentCard from '../components/AssignmentCard';
import AssignmentHistory from '../components/AssignmentHistory';

const StudentAssignments = ({ assignments }) => {
  const [activeTab, setActiveTab] = useState('current');

  // Separate assignments by status
  const currentAssignments = assignments.filter(a => a.status === 'pending');
  const completedAssignments = assignments.filter(a => a.status === 'completed');

  const handleStartAssignment = (assignmentId) => {
    // Navigate to assignment taking page
    window.location.href = `/assignment/${assignmentId}`;
  };

  const handleViewResults = (assignmentId) => {
    // Show detailed results/history
    console.log('Viewing results for assignment:', assignmentId);
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <button
          onClick={() => setActiveTab('current')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: activeTab === 'current' ? '#3b82f6' : 'transparent',
            color: activeTab === 'current' ? 'white' : '#64748b',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Current Assignments ({currentAssignments.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: activeTab === 'history' ? '#3b82f6' : 'transparent',
            color: activeTab === 'history' ? 'white' : '#64748b',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          History ({completedAssignments.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'current' ? (
        <div>
          <h2 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>
            Current Assignments
          </h2>
          {currentAssignments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <p>No current assignments</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {currentAssignments.map(assignment => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onStart={handleStartAssignment}
                  onViewResults={handleViewResults}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <AssignmentHistory 
          completedAssignments={completedAssignments}
        />
      )}
    </div>
  );
};

export default StudentAssignments;