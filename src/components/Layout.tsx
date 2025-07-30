// src/components/Layout.tsx

import React, { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { UserButton, useUser } from '@clerk/nextjs';
import UploadModal from './UploadModal';
import { useRouter } from 'next/router';

// --- FIX: Define and apply a type for the NavLink component's props ---
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
        <Link href={href} className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/40' : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'}`}>
            {icon}
            <span className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>{!isCollapsed && children}</span>
        </Link>
    );
};

// --- FIX: Define and apply a type for the Layout component's props ---
export default function Layout({ children }: { children: ReactNode }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user } = useUser();
    const router = useRouter();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (router.pathname.startsWith('/deals/') && window.innerWidth < 1280) {
                setIsSidebarCollapsed(true);
            } else {
                setIsSidebarCollapsed(false);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [router.pathname]);

    const isDashboard = router.pathname === '/';

    return (
        <div className="min-h-screen flex">
            <aside className={`glass-panel p-4 flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
                <div className={`flex items-center gap-3 mb-12 p-2 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                    <svg className="w-8 h-8 text-sky-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                    </svg>
                    {!isSidebarCollapsed && <h1 className="text-2xl font-bold text-slate-100 whitespace-nowrap">IIP</h1>}
                </div>
                <nav className="flex flex-col gap-4">
                    <NavLink href="/" isCollapsed={isSidebarCollapsed} icon={
                        <svg className="w-6 h-6 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
                    }>Dashboard</NavLink>
                    <NavLink href="/deal-room" isCollapsed={isSidebarCollapsed} icon={
                         <svg className="w-6 h-6 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>
                    }>Deal Room</NavLink>
                    <NavLink href="/data-room" isCollapsed={isSidebarCollapsed} icon={
                        <svg className="w-6 h-6 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" /></svg>
                    }>Data Room</NavLink>
                </nav>
                <div className="mt-auto">
                    <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="w-full flex items-center gap-3 p-3 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition-colors">
                        <svg className={`w-6 h-6 flex-shrink-0 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m-3 0l3-3m0 0l-3-3m3 3H9" />
                        </svg>
                        {!isSidebarCollapsed && <span className="font-medium">Collapse</span>}
                    </button>
                </div>
            </aside>
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 fade-in">
                    <div>
                        {isDashboard && (
                            <>
                                <h2 className="text-3xl font-bold text-slate-100">Deal Flow Dashboard</h2>
                                <p className="text-slate-400 mt-1">Welcome back, {user?.firstName || 'Analyst'}. Here&apos;s your current deal pipeline.</p>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-4 mt-4 sm:mt-0">
                        <button onClick={() => setIsModalOpen(true)} className="bg-sky-500 text-white font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-sky-600 transition-all duration-300 glow-on-hover primary-button-glow">
                            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                            Upload CIM
                        </button>
                        <UserButton afterSignOutUrl="/sign-in" />
                    </div>
                </header>
                {children}
            </main>
            <UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}
