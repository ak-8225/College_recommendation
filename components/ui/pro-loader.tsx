import React from "react";

export default function ProLoader({ name }: { name: string }) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-br from-green-400/10 to-blue-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-gradient-to-br from-pink-400/15 to-red-500/15 rounded-full blur-xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Main content with enhanced styling */}
      <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
        {/* Enhanced greeting with better typography */}
        <div className="mb-12">
          <div className="text-4xl font-bold text-center">
            <span className="text-gray-800">Hello </span>
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent inline-block">
              {name}
            </span>
          </div>
          <div className="w-32 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 rounded-full mx-auto animate-pulse shadow-lg"></div>
        </div>

        {/* Professional loading message with phone fetching indicator */}
        <div className="mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="text-xl md:text-2xl text-gray-700 font-semibold">Fetching your profile</span>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0s' }}></div>
              <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
          
          {/* Enhanced progress bar */}
          <div className="w-80 h-3 bg-gray-200 rounded-full mx-auto overflow-hidden shadow-inner">
            <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 rounded-full animate-progress shadow-sm"></div>
          </div>
        </div>

        {/* Enhanced animated icons with better styling */}
        <div className="flex items-center justify-center gap-12 mb-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white animate-pulse shadow-lg border border-blue-400/20">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <span className="text-sm text-gray-600 font-medium">Analyzing</span>
          </div>
          
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white animate-pulse shadow-lg border border-purple-400/20" style={{ animationDelay: '0.5s' }}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-sm text-gray-600 font-medium">Processing</span>
          </div>
          
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white animate-pulse shadow-lg border border-indigo-400/20" style={{ animationDelay: '1s' }}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm text-gray-600 font-medium">Optimizing</span>
          </div>
        </div>

        {/* Enhanced status message */}
        <div className="text-base text-gray-500 font-medium bg-white/50 backdrop-blur-sm rounded-full px-6 py-3 shadow-sm border border-gray-200/50">
          Preparing your personalized college recommendations...
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        
        @keyframes progress {
          0% {
            width: 0%;
          }
          50% {
            width: 70%;
          }
          100% {
            width: 100%;
          }
        }
        
        .animate-gradient-x {
          animation: gradient-x 3s ease-in-out infinite;
        }
        
        .animate-progress {
          animation: progress 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
} 