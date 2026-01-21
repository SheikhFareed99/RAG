import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Welcome() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('');

  const handleGetStarted = async () => {
    setIsLoading(true);
    setBackendStatus('Initializing application loading the models please wait...');

    const pollInterval = 2000;
    const maxTimeout = 60000;
    const startTime = Date.now();

    const checkBackend = async () => {
      try {
        const response = await fetch('http://localhost:8000/health');
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'ready') {
            setBackendStatus('Ready to go!');
            setTimeout(() => router.replace('/home'), 500);
            return;
          }
        }
        if (Date.now() - startTime < maxTimeout) {
          setBackendStatus('loading the model...');
          setTimeout(checkBackend, pollInterval);
        } else {
          setBackendStatus('Connection timed out');
          setIsLoading(false);
        }
      } catch (error) {
        if (Date.now() - startTime < maxTimeout) {
          setBackendStatus('Establishing connection...');
          setTimeout(checkBackend, pollInterval);
        } else {
          setBackendStatus('Unable to connect');
          setIsLoading(false);
        }
      }
    };

    checkBackend();
  };

  return (
    <>
      <Head>
        <title>DocChat | Welcome</title>
        <meta name="description" content="Intelligent document conversations" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center px-4 py-12">
  
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200 rounded-full opacity-20"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-indigo-200 rounded-full opacity-20"></div>
        
        <div className="max-w-md w-full relative z-10">
      
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Welcome to <span className="text-blue-600">DocChat</span>
            </h1>
            <p className="text-gray-600">
              Transform your documents into meaningful conversations
            </p>
          </div>

          {/* Main card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Ready to begin?
                </h2>
                <p className="text-gray-500 text-sm">
                  Upload PDFs and chat with AI-powered insights
                </p>
              </div>

              {/* Status display */}
              {isLoading && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-blue-700">{backendStatus}</span>
                  </div>
                  <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse w-2/3"></div>
                  </div>
                </div>
              )}

              {/* Features list */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>PDF,DOCX and txt Support</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Smart Search</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>AI Insights</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Secure & Private</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={handleGetStarted}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center space-x-2 group"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Setting up...</span>
              </>
            ) : (
              <>
                <span>Get Started</span>
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>

          {/* Footer note */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
            
            </p>
          </div>
        </div>
      </div>
    </>
  );
}