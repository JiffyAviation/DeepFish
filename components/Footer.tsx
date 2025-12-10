import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-zinc-900 border-t border-zinc-800 py-8 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-2">DeepFish</h3>
                        <p className="text-sm text-zinc-400">
                            AI is deep; we can go there.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-sm font-semibold text-zinc-300 mb-3">Legal</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/terms"
                                    className="text-sm text-zinc-400 hover:text-indigo-400 transition-colors"
                                >
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/privacy"
                                    className="text-sm text-zinc-400 hover:text-indigo-400 transition-colors"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-sm font-semibold text-zinc-300 mb-3">Contact</h4>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="mailto:support@deepfish.ai"
                                    className="text-sm text-zinc-400 hover:text-indigo-400 transition-colors"
                                >
                                    support@deepfish.ai
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://github.com/JiffyAviation/DeepFish"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-zinc-400 hover:text-indigo-400 transition-colors"
                                >
                                    GitHub
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
                    <p className="text-xs text-zinc-500">
                        © 2025 DeepFish. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};
