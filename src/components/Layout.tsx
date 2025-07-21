import React from 'react';
import Link from 'next/link';
import { UserButton, SignedIn, SignedOut } from '@clerk/nextjs';

export default function Layout({ children, onUploadClick }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center space-x-3">
                            <div className="bg-blue-600 p-2 rounded-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            </div>
                            <span className="text-2xl font-bold text-gray-800 hidden sm:block">IIP</span>
                        </Link>
                        <div className="flex items-center space-x-4">
                            <SignedIn>
                                <button onClick={onUploadClick} className="flex items-center bg-blue-600 text-white rounded-md px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                    <span>Upload CIM</span>
                                </button>
                                <UserButton afterSignOutUrl="/sign-in" />
                            </SignedIn>
                            <SignedOut>
                                <Link href="/sign-in" className="text-sm font-semibold text-gray-600 hover:text-gray-900">
                                    Sign In
                                </Link>
                            </SignedOut>
                        </div>
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}