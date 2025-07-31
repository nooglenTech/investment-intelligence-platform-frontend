import React from 'react';
import '../styles/globals.css'; // FIX: Added this import to load all global styles
import Layout from '../components/Layout';
import type { AppProps } from "next/app";
import { DealProvider } from '../context/DealContext';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '../context/ThemeContext';

// Set the public key for Clerk
const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider publishableKey={clerkPubKey} {...pageProps}>
      <ThemeProvider>
        <DealProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </DealProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default MyApp;
