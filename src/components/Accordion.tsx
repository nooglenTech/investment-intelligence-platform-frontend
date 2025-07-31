// src/components/Accordion.tsx

import React, { useState, useRef, useEffect, ReactNode } from 'react';

type AccordionProps = {
    title: string;
    children: ReactNode;
    defaultOpen?: boolean;
};

const Accordion = ({ title, children, defaultOpen = false }: AccordionProps) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.style.maxHeight = isOpen ? `${contentRef.current.scrollHeight}px` : '0px';
        }
    }, [isOpen]);


    return (
        <div className="glass-panel rounded-xl p-6">
            <button
                className="flex justify-between items-center w-full text-left"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h3>
                <svg
                    className={`w-6 h-6 transform transition-transform text-slate-400 ${isOpen ? 'rotate-180' : ''}`}
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
            </button>
            <div
                ref={contentRef}
                className="accordion-content overflow-hidden transition-all duration-500 ease-in-out"
            >
                <div className="pt-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Accordion;
