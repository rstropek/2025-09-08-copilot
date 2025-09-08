'use client';

import { useCallback } from 'react';

export interface JointAngles {
  j0: number; // Base yaw
  j1: number; // Shoulder pitch
  j2: number; // Elbow pitch
  j3: number; // Wrist pitch
  j4: number; // Pipette tilt
}

interface JointControlsProps {
  angles: JointAngles;
  onAnglesChange: (angles: JointAngles) => void;
  className?: string;
}

const JOINT_LABELS = {
  j0: 'Base Yaw (J0)',
  j1: 'Shoulder Pitch (J1)', 
  j2: 'Elbow Pitch (J2)',
  j3: 'Wrist Pitch (J3)',
  j4: 'Pipette Tilt (J4)'
};

// Convert radians to degrees for display
const radToDeg = (rad: number): number => Math.round((rad * 180) / Math.PI);

// Convert degrees to radians for calculation
const degToRad = (deg: number): number => (deg * Math.PI) / 180;

export default function JointControls({ angles, onAnglesChange, className = '' }: JointControlsProps) {
  const handleJointChange = useCallback((joint: keyof JointAngles, degrees: number) => {
    const radians = degToRad(degrees);
    onAnglesChange({
      ...angles,
      [joint]: radians
    });
  }, [angles, onAnglesChange]);

  const resetToHome = useCallback(() => {
    onAnglesChange({
      j0: 0,
      j1: degToRad(-75),
      j2: degToRad(45),
      j3: degToRad(15),
      j4: degToRad(90)
    });
  }, [onAnglesChange]);

  return (
    <div className={className}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '15px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Joint Controls</h3>
          <button 
            onClick={resetToHome}
            style={{
              padding: '6px 12px',
              fontSize: '14px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
          >
            Reset to Home
          </button>
        </div>
        
        {(Object.keys(JOINT_LABELS) as Array<keyof JointAngles>).map((joint) => (
          <div key={joint} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label 
                htmlFor={`slider-${joint}`}
                style={{ fontSize: '14px', fontWeight: '500', color: '#495057' }}
              >
                {JOINT_LABELS[joint]}
              </label>
              <span style={{ 
                fontSize: '14px', 
                fontWeight: '600',
                color: '#007bff',
                minWidth: '45px',
                textAlign: 'right'
              }}>
                {radToDeg(angles[joint])}°
              </span>
            </div>
            <input
              id={`slider-${joint}`}
              type="range"
              min="-90"
              max="90"
              step="1"
              value={radToDeg(angles[joint])}
              onChange={(e) => handleJointChange(joint, parseInt(e.target.value))}
              style={{
                width: '100%',
                height: '6px',
                borderRadius: '3px',
                background: '#e9ecef',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: '12px', 
              color: '#6c757d' 
            }}>
              <span>-90°</span>
              <span>0°</span>
              <span>90°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
