import React, { useState, useRef, useEffect } from 'react';

const Toast = ({ msg, show }) => (
  <div
    style={{
      position: "fixed",
      bottom: 28,
      left: "50%",
      transform: `translateX(-50%) translateY(${show ? 0 : 80}px)`,
      background: "rgba(45,212,191,.15)",
      border: "1px solid rgba(45,212,191,.3)",
      color: "var(--teal)",
      padding: "10px 22px",
      borderRadius: 50,
      fontSize: 14,
      fontWeight: 700,
      transition: "transform .3s",
      zIndex: 9999,
      pointerEvents: "none",
    }}
  >
    {msg}
  </div>
);

export default Toast;
