// src/components/Layout.tsx

import React, { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { UserButton, useUser } from '@clerk/nextjs';
import UploadModal from './UploadModal';
import { useRouter } from 'next/router';
import { useTheme } from '../context/ThemeContext';

interface NavLinkProps {
    href: string;
    icon: ReactNode;
    children: ReactNode;
    isCollapsed: boolean;
}

const NavLink = ({ href, icon, children, isCollapsed }: NavLinkProps) => {
    const router = useRouter();
    const isActive = router.pathname === href;

    return (
        <Link href={href} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-semibold transition-colors duration-200 ${isActive ? 'bg-gray-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
            {icon}
            <span className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>{!isCollapsed && children}</span>
        </Link>
    );
};

export default function Layout({ children }: { children: ReactNode }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user } = useUser();
    const router = useRouter();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) setIsSidebarCollapsed(true);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isDashboard = router.pathname === '/';

    return (
        <div className="min-h-screen flex">
            <aside className={`sidebar p-4 flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-24' : 'w-64'}`}>
                <div className={`flex items-center gap-3 mb-8 p-2 border-b border-gray-200 dark:border-slate-800 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                    <svg className="w-8 h-8 text-emerald-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                    </svg>
                    {!isSidebarCollapsed && <h1 className="text-2xl font-bold text-slate-900 dark:text-white whitespace-nowrap">IIP</h1>}
                </div>
                <nav className="flex-1 flex flex-col gap-2">
                    <NavLink href="/" isCollapsed={isSidebarCollapsed} icon={ <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 6V4c0-1.1-.9-2-2-2H5C3.9 2 3 2.9 3 4v2"/><path d="M3 18v2c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-2"/><path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3v0a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3v0Z"/></svg> }>Dashboard</NavLink>
                    <NavLink href="/deal-room" isCollapsed={isSidebarCollapsed} icon={ <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-4.44a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.88z"></path><path d="M15 2v6h6"></path></svg> }>Deal Room</NavLink>
                    <NavLink href="/data-room" isCollapsed={isSidebarCollapsed} icon={ <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg> }>Data Room</NavLink>
                
                    <div className="mt-auto">
                         <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="w-full flex items-center gap-3 p-3 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                            <svg className={`w-6 h-6 flex-shrink-0 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m-3 0l3-3m0 0l-3-3m3 3H9" />
                            </svg>
                            {!isSidebarCollapsed && <span className="font-medium">Collapse</span>}
                        </button>
                    </div>
                </nav>
                
                <div className={`p-2 border-t border-gray-200 dark:border-slate-800 flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                    <div className={`flex items-center ${isSidebarCollapsed ? 'hidden' : ''}`}>
                        <div className="flex-shrink-0">
                            <UserButton afterSignOutUrl="/sign-in" />
                        </div>
                        <div className="ml-2">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.firstName}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Analyst</p>
                        </div>
                    </div>
                    <button onClick={toggleTheme} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none">
                        {theme === 'light' ? (
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                        ) : (
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        )}
                    </button>
                </div>
            </aside>
            <main className="main-content flex-1 overflow-y-auto p-8">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 fade-in">
                    <div>
                        {isDashboard && (
                            <>
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Deal Flow Dashboard</h2>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome back, {user?.firstName || 'Analyst'}. Here&apos;s your current deal pipeline.</p>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-4 mt-4 sm:mt-0">
                        <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 text-white font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition-all duration-300 shadow-sm hover:shadow-md">
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H5.5z" /><path d="M9 13.5V9m0 0l-2 2m2-2l2 2" /></svg>
                            Upload CIM
                        </button>
                    </div>
                </header>
                {children}
            </main>
            <UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}
