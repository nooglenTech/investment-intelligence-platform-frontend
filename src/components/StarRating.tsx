// src/components/StarRating.tsx

import React, { useState } from 'react';

// --- FIX: Define and apply a type for the component's props ---
interface StarRatingProps {
  label: string;
  metric: string;
  value: number;
  onChange: (metric: string, value: number) => void;
}

export default function StarRating({ label, metric, value, onChange }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);

  return (
    <div className="flex justify-between items-center">
      <label className="font-medium text-sm">{label}</label>
      <div 
        className="flex"
        onMouseLeave={() => setHoverValue(0)}
      >
        {[1, 2, 3, 4, 5].map((starValue) => (
          <span
            key={starValue}
            className="cursor-pointer text-2xl transition-colors"
            onMouseEnter={() => setHoverValue(starValue)}
            onClick={() => onChange(metric, starValue)}
          >
            <i 
              className={`fa-solid fa-star ${
                (hoverValue || value) >= starValue ? 'text-amber-400' : 'text-gray-300'
              }`}
            ></i>
          </span>
        ))}
      </div>
    </div>
  );
}
