import React from 'react';
import '../styles/globals.css';
import Layout from '../components/Layout';
import type { AppProps } from "next/app";
import { DealProvider } from '../context/DealContext';
import { ClerkProvider } from '@clerk/nextjs';

// Set the public key for Clerk
const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider publishableKey={clerkPubKey} {...pageProps}>
      <DealProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </DealProvider>
    </ClerkProvider>
  );
}

export default MyApp;