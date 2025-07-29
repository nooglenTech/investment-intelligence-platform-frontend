// src/components/IndustryFilter.tsx

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { IBIS_INDUSTRIES } from '../data/ibis-industries';

export default function IndustryFilter({ value, onChange }) {
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  const suggestions = useMemo(() => {
    if (!inputValue) return [];
    return IBIS_INDUSTRIES.filter(industry =>
      industry.toLowerCase().includes(inputValue.toLowerCase())
    ).slice(0, 10); // Limit suggestions
  }, [inputValue]);

  // Handle clicks outside of the component to close suggestions
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);
  
  const handleSelect = (industry) => {
    setInputValue(industry);
    onChange(industry);
    setShowSuggestions(false);
  };

  const handleChange = (e) => {
    setInputValue(e.target.value);
    onChange(e.target.value); // Allow free text search
    setShowSuggestions(true);
  }

  return (
    <div className="relative w-full sm:w-1/2 lg:w-1/3" ref={wrapperRef}>
      <input
        type="text"
        placeholder="Search by industry..."
        value={inputValue}
        onChange={handleChange}
        onFocus={() => setShowSuggestions(true)}
        className="w-full bg-slate-900/70 border border-slate-600 rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
      />
       <svg className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 transform -translate-y-1/2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
         <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
       </svg>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map(industry => (
            <li
              key={industry}
              onClick={() => handleSelect(industry)}
              className="px-4 py-2 text-slate-300 hover:bg-sky-500/20 cursor-pointer"
            >
              {industry}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
