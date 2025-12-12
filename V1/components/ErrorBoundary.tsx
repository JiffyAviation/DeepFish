import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Icon } from './Icon';

interface Props {
    children: ReactNode;
    fallbackUI?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary - Catches React component errors
 * Prevents blank screen, shows fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallbackUI) {
                return this.props.fallbackUI;
            }

            return (
                <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
                    <div className="max-w-2xl w-full">
                        <div className="border border-red-900/50 bg-red-950/20 rounded-lg p-8">
                            <div className="flex items-start gap-4 mb-6">
                                <Icon name="AlertTriangle" className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
                                <div>
                                    <h1 className="text-2xl font-bold text-red-400 mb-2">
                                        Something went wrong
                                    </h1>
                                    <p className="text-zinc-300">
                                        The application encountered an error. Don't worry, your data is safe.
                                    </p>
                                </div>
                            </div>

                            {this.state.error && (
                                <div className="mb-6 p-4 bg-black/50 rounded border border-zinc-800">
                                    <p className="text-sm font-mono text-red-400 mb-2">
                                        {this.state.error.toString()}
                                    </p>
                                    {this.state.errorInfo && (
                                        <details className="text-xs text-zinc-500 mt-2">
                                            <summary className="cursor-pointer hover:text-zinc-400">
                                                Stack trace
                                            </summary>
                                            <pre className="mt-2 overflow-auto">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={this.handleReset}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <Icon name="RefreshCw" className="w-4 h-4" />
                                    Try Again
                                </button>
                                <button
                                    onClick={this.handleReload}
                                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <Icon name="RotateCcw" className="w-4 h-4" />
                                    Reload Page
                                </button>
                                <a
                                    href="/"
                                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <Icon name="Home" className="w-4 h-4" />
                                    Go Home
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
