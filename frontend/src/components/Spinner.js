import React from 'react';

const Spinner = () => (
  <div
    style={{
      width: 20,
      height: 20,
      border: "2px solid rgba(255,184,48,.3)",
      borderTop: "2px solid var(--amber)",
      borderRadius: "50%",
      animation: "spin .7s linear infinite",
      flexShrink: 0,
    }}
  />
);

export default Spinner;
