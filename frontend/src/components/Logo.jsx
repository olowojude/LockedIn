// components/Logo.jsx
import React from 'react';

const LockedInLogo = ({ className = "", size = "default" }) => {
  const sizeClasses = {
    small: "text-lg",
    default: "text-xl",
    large: "text-2xl"
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`font-bold text-gray-900 tracking-tight ${sizeClasses[size]}`}>
        Locked<span className="text-indigo-600">In</span>
      </div>
    </div>
  );
};

export default LockedInLogo;