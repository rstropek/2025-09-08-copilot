'use client';

import { useState } from "react";
import RobotArmScene from "@/components/arm";
import JointControls, { JointAngles } from "@/components/joint-controls";

const AVAILABLE_COLORS = [
  { value: 'red', label: 'Red' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'black', label: 'Black' },
  { value: 'white', label: 'White' },
];

// Default home pose angles in radians
const DEFAULT_JOINT_ANGLES: JointAngles = {
  j0: 0,                     // base yaw: 0°
  j1: -75 * Math.PI / 180,   // shoulder pitch: -75°
  j2: 45 * Math.PI / 180,    // elbow pitch: +45°
  j3: 15 * Math.PI / 180,    // wrist pitch: +15°
  j4: 90 * Math.PI / 180     // pipette tilt: 90°
};

export default function Home() {
  const [selectedColor, setSelectedColor] = useState('black');
  const [jointAngles, setJointAngles] = useState<JointAngles>(DEFAULT_JOINT_ANGLES);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Robot Arm Demo</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="color-select" style={{ marginRight: '10px', fontSize: '16px' }}>
          Robot Color:
        </label>
        <select
          id="color-select"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          style={{
            padding: '8px 12px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer'
          }}
        >
          {AVAILABLE_COLORS.map((color) => (
            <option key={color.value} value={color.value}>
              {color.label}
            </option>
          ))}
        </select>
      </div>

      <JointControls
        angles={jointAngles}
        onAnglesChange={setJointAngles}
        className="joint-controls"
      />

      <RobotArmScene 
        className="scene" 
        color={selectedColor} 
        jointAngles={jointAngles}
      />
    </div>
  );
}
