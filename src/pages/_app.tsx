import React from 'react';
import '../styles/globals.css';
import Layout from '../components/Layout';
import type { AppProps } from "next/app";
import { useRouter } from 'next/router';
import { DealProvider } from '../context/DealContext';

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const handleUploadClick = () => {
    router.push('/upload');
  };
  return (
    <DealProvider>
      <Layout onUploadClick={handleUploadClick}>
        <Component {...pageProps} />
      </Layout>
    </DealProvider>
  );
}
