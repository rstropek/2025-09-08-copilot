'use client';

import { useState } from "react";
import RobotArmScene from "@/components/arm";

const AVAILABLE_COLORS = [
  { value: 'red', label: 'Red' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'black', label: 'Black' },
  { value: 'white', label: 'White' },
];

export default function Home() {
  const [selectedColor, setSelectedColor] = useState('black');

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

      <RobotArmScene className="scene" color={selectedColor} />
    </div>
  );
}
