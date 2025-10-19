import React from 'react';

export default function LoadingComponent() {
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#EEECDA' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div
            className="absolute inset-0 rounded-full animate-spin"
            style={{
              border: '4px solid transparent',
              borderTopColor: '#98479A',
              borderRightColor: '#98479A'
            }}
          />
        </div>
        <p className="text-lg font-medium" style={{ color: '#98479A' }}>
          Loading...
        </p>
      </div>
    </div>
  );
};