import React from 'react';
import { FaPlay, FaEye, FaCheck, FaClock, FaStar } from 'react-icons/fa';

const AssignmentCard = ({ assignment, onStart, onViewResults }) => {
  const getStatusConfig = () => {
    if (assignment.status === 'completed' && assignment.grade !== null) {
      return {
        status: 'graded',
        color: '#10b981',
        bgColor: '#ecfdf5',
        icon: <FaStar />,
        actionText: 'View Results',
        actionIcon: <FaEye />,
        canTake: false
      };
    }
    
    if (assignment.status === 'completed') {
      return {
        status: 'completed',
        color: '#3b82f6',
        bgColor: '#eff6ff',
        icon: <FaCheck />,
        actionText: 'View Submission',
        actionIcon: <FaEye />,
        canTake: false
      };
    }
    
    return {
      status: 'pending',
      color: '#f59e0b',
      bgColor: '#fffbeb',
      icon: <FaClock />,
      actionText: 'Start Assignment',
      actionIcon: <FaPlay />,
      canTake: true
    };
  };

  const config = getStatusConfig();

  const handleAction = () => {
    if (config.canTake) {
      onStart(assignment.id);
    } else {
      onViewResults(assignment.id);
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: `2px solid ${config.color}20`,
      position: 'relative'
    }}>
      {/* Status Badge */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        background: config.bgColor,
        color: config.color,
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        {config.icon}
        {config.status.toUpperCase()}
      </div>

      {/* Assignment Info */}
      <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '600' }}>
        {assignment.title}
      </h3>
      
      <p style={{ margin: '0 0 12px', color: '#64748b', fontSize: '14px' }}>
        {assignment.description}
      </p>

      {/* Grade Display (if graded) */}
      {assignment.grade !== null && (
        <div style={{
          background: '#f8fafc',
          padding: '12px',
          borderRadius: '8px',
          margin: '12px 0',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '600', color: '#374151' }}>Grade:</span>
            <span style={{ 
              fontSize: '18px', 
              fontWeight: '700', 
              color: assignment.grade >= 70 ? '#10b981' : assignment.grade >= 50 ? '#f59e0b' : '#ef4444'
            }}>
              {assignment.grade}%
            </span>
          </div>
          {assignment.feedback && (
            <div style={{ marginTop: '8px' }}>
              <span style={{ fontWeight: '600', color: '#374151', fontSize: '14px' }}>Feedback:</span>
              <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b' }}>
                {assignment.feedback}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Assignment Details */}
      <div style={{ display: 'flex', gap: '16px', margin: '12px 0', fontSize: '14px', color: '#64748b' }}>
        <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
        {assignment.submitted_at && (
          <span>Submitted: {new Date(assignment.submitted_at).toLocaleDateString()}</span>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={handleAction}
        style={{
          background: config.canTake ? config.color : '#64748b',
          color: 'white',
          border: 'none',
          padding: '12px 20px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: config.canTake ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          width: '100%',
          justifyContent: 'center',
          opacity: config.canTake ? 1 : 0.8
        }}
      >
        {config.actionIcon}
        {config.actionText}
      </button>

      {/* History Note for Completed */}
      {!config.canTake && (
        <p style={{
          margin: '8px 0 0',
          fontSize: '12px',
          color: '#64748b',
          textAlign: 'center',
          fontStyle: 'italic'
        }}>
          This assignment is completed and available for reference only
        </p>
      )}
    </div>
  );
};

export default AssignmentCard;