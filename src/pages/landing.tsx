// src/pages/landing.tsx

import React from 'react';
import Link from 'next/link';
import { SignedOut, SignedIn } from '@clerk/nextjs';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-900 text-center p-4">
      <div className="max-w-2xl">
        <svg 
          className="w-24 h-24 mx-auto text-emerald-500 mb-6" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          strokeWidth={1.5} 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
        </svg>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
          Welcome to the Investment Intelligence Platform
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
          Streamline your deal flow with AI-powered analysis and collaborative feedback.
        </p>
        
        {/* Shows login/signup buttons if the user is signed out */}
        <SignedOut>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-in" className="w-full sm:w-auto bg-emerald-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-emerald-700 transition-all duration-300 shadow-sm hover:shadow-md">
                Sign In
            </Link>
            <Link href="/sign-up" className="w-full sm:w-auto bg-slate-200 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 font-semibold px-8 py-3 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600/50 transition-all duration-300">
                Sign Up
            </Link>
          </div>
        </SignedOut>

        {/* Shows a button to go to the dashboard if the user is signed in */}
        <SignedIn>
            <div className="mt-8">
                <Link href="/" className="bg-emerald-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-emerald-700 transition-all duration-300 shadow-sm hover:shadow-md">
                    Go to Dashboard
                </Link>
            </div>
        </SignedIn>
      </div>
    </div>
  );
}
