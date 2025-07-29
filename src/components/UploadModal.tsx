// src/components/UploadModal.tsx

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useDeals } from '../context/DealContext';
import { useAuth } from '@clerk/nextjs';

export default function UploadModal({ isOpen, onClose }) {
  const { addDeal } = useDeals();
  const { getToken } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const router = useRouter();

  const handleUpload = async (file: File) => {
    if (!file) return;
    
    setIsProcessing(true);
    setErrorText("");
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = await getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/analyze/`, {
        method: "POST",
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Upload failed');
      }

      const newDeal = await res.json();
      addDeal(newDeal);
      handleClose();
      router.push('/'); 

    } catch (err) {
      setErrorText(`❌ An error occurred: ${err.message}`);
      setIsProcessing(false);
    }
  };
  
  const handleFileSelect = (file: File | null | undefined) => {
      if(file && file.type === "application/pdf") {
          handleUpload(file);
      } else {
          setErrorText("Please select a valid PDF file.");
      }
  }

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleFileSelect(event.dataTransfer.files[0]);
      event.dataTransfer.clearData();
    }
  }, []);

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };
  
  const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  };

  const handleClose = () => {
      if(isProcessing) return;
      setIsProcessing(false);
      setErrorText("");
      onClose();
  }

  if (!isOpen) return null;

  return (
    <div id="upload-modal" className="fixed inset-0 bg-slate-900/80 modal-backdrop flex items-center justify-center p-4 z-50 fade-in" onClick={handleClose}>
      <div id="modal-content" className="glass-panel rounded-xl w-full max-w-2xl transform transition-all" onClick={e => e.stopPropagation()}>
        {isProcessing ? (
           <div className="p-8 text-center">
             <div className="w-16 h-16 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
             <h2 className="text-2xl font-bold text-slate-100 mt-6">Analyzing Document...</h2>
             <p className="text-slate-400 mt-2">This may take up to a minute. Please wait.</p>
             {errorText && <div className="mt-4 bg-red-500/20 text-red-300 p-3 rounded-lg">{errorText}</div>}
           </div>
        ) : (
          <div>
            <div className="p-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-100">Upload Confidential Deck</h2>
                <button onClick={handleClose} className="text-slate-500 hover:text-slate-200 text-3xl transition-colors">&times;</button>
              </div>
              <p className="text-slate-400 mt-2">Drag & drop your PDF or browse to upload.</p>
            </div>
            <div className="p-8 border-t border-slate-700">
              <div
                id="dropzone"
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => document.getElementById('file-input')?.click()}
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${isDragOver ? 'border-sky-500 bg-slate-800/50' : 'border-slate-600'}`}
              >
                <svg className="w-16 h-16 mx-auto text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 17.25V6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v10.5A2.25 2.25 0 0118.75 21H5.25A2.25 2.25 0 013 17.25z" /></svg>
                <p className="mt-4 text-slate-300">Drop PDF here</p>
                <p className="text-sm text-slate-500">or click to browse</p>
                <input id="file-input" type="file" className="hidden" accept=".pdf" onChange={(e) => handleFileSelect(e.target.files?.[0])} />
              </div>
              {errorText && <div className="mt-4 text-red-400 text-center">{errorText}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
