import React from 'react';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-6xl font-serif text-white mb-4">DeepFish</h1>
        <p className="text-xl text-neutral-400 font-light tracking-wide">
          AI is deep; we can go there.
        </p>
        
        <div className="mt-12">
          <Link 
            to="/app" 
            className="px-8 py-3 bg-white text-black hover:bg-neutral-200 transition-colors rounded-none font-medium tracking-wider"
          >
            ENTER STUDIO
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;
