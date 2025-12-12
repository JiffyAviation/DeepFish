import React from 'react';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
    return (
        <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-3xl text-center space-y-12 relative z-10">
                <div className="space-y-4">
                    <h1 className="text-7xl md:text-9xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                        DeepFish
                    </h1>
                    <p className="text-xl md:text-2xl text-neutral-400 font-light tracking-[0.2em] uppercase">
                        Start Your Own Design Firm
                    </p>
                </div>

                <div className="max-w-xl mx-auto text-neutral-500 leading-relaxed font-light">
                    <p>
                        A multi-agent AI system designed for excellence, not speed.
                        Your dedicated team of specialists is waiting in the boardroom.
                    </p>
                </div>

                <div className="pt-8">
                    <Link
                        to="/app"
                        className="group relative inline-flex items-center justify-center px-12 py-4 text-sm font-medium tracking-widest uppercase transition-all duration-200 bg-white text-black hover:bg-neutral-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-neutral-900"
                    >
                        <span>Enter Studio</span>
                        <div className="absolute inset-0 border border-white translate-x-1 translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 group-hover:translate-y-2 transition-all duration-200 -z-10"></div>
                    </Link>
                </div>
            </div>

            {/* Footer / Status */}
            <div className="absolute bottom-8 text-xs text-neutral-600 tracking-widest uppercase">
                System Status: Online • v1.0.0
            </div>
        </div>
    );
};

export default Landing;
