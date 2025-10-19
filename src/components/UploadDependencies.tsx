'use client'
import React, { useState } from 'react';

interface UploadDependenciesProps {
  processDependencies: ({ type, data }: { type: 'name' | 'link' | 'python', data: string }) => void;
  state: 'null' | 'page-loading' | 'saving-data' | 'processing-data';
}

export default function UploadDependenciesComponent({ processDependencies, state }: UploadDependenciesProps) {
  const [selectedType, setSelectedType] = useState<'name' | 'link' | 'python'>('name');
  const [dependencies, setDependencies] = useState('');

  const handleProcess = () => {
    processDependencies({ type: selectedType, data: dependencies });
  };

  return (
    <div className='w-full min-w-[300px] flex flex-col items-center gap-4 py-8'>
      {/* Header Section */}
      <div className='w-full mt-5'>
        <div className='text-5xl font-bold mb-2' style={{ color: '#98479A' }}>
          Upload Dependencies
        </div>
        <div className='text-xl' style={{ color: '#98479A' }}>
          Use newlines to denote new dependencies
        </div>
      </div>

      {/* Main Form Container */}
      <div 
        className='w-full rounded-2xl py-10 px-12 flex flex-col gap-6'
        style={{ backgroundColor: '#AB7431' }}
      >
        {/* Dependency Type Selector */}
        <div className='flex flex-col gap-3'>
          <label className='text-white text-xl font-medium'>
            Select Dependency Type:
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as 'name' | 'link' | 'python')}
            className="w-full rounded-lg px-4 py-3 text-white text-lg"
            style={{ backgroundColor: '#CB9451' }}
          >
            <option key={'name'} value={'name'}>
              Dependency name
            </option>
            <option key={'link'} value={'link'}>
              Github link
            </option>
            <option key={'python'} value={'python'}>
              Python requirements
            </option>
          </select>
        </div>

        {/* Dependencies Input Area */}
        <div className='flex flex-col gap-2'>
          <textarea
            value={dependencies}
            onChange={(e) => setDependencies(e.target.value)}
            placeholder="Paste your dependencies in here"
            className="w-full rounded-lg px-4 py-4 text-white text-lg min-h-[300px] resize-none"
            style={{ backgroundColor: '#CB9451' }}
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleProcess}
        disabled={state !== 'null'}
        className={`w-full rounded-lg px-8 py-4 text-white text-xl font-medium ${state !== 'null' ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={{ backgroundColor: '#008044' }}
      >
        Submit
      </button>
    </div>

  );
};
