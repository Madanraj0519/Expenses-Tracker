import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.href = '/dashboard';
    };

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-6">
                    <div className="max-w-lg w-full bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-2xl p-8 shadow-2xl text-center">
                        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-500/20 text-red-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
                        <p className="text-slate-300 text-sm mb-6">
                            An unexpected error occurred while rendering this view. Don't worry, your data is safe.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                            <button
                                onClick={this.handleReload}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 font-medium text-sm rounded-lg transition-all shadow-md active:scale-95"
                            >
                                Reload Page
                            </button>
                            <button
                                onClick={this.handleReset}
                                className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 font-medium text-sm rounded-lg transition-all active:scale-95"
                            >
                                Return to Dashboard
                            </button>
                        </div>

                        {process.env.NODE_ENV !== 'production' && this.state.error && (
                            <div className="mt-4 text-left">
                                <details className="cursor-pointer bg-slate-900/90 rounded-lg p-3 border border-slate-700/60 text-xs text-red-300 font-mono overflow-auto max-h-40">
                                    <summary className="font-semibold text-slate-400 mb-1">Developer Error Details</summary>
                                    <p className="font-bold">{this.state.error.toString()}</p>
                                    <pre className="mt-2 whitespace-pre-wrap">{this.state.errorInfo?.componentStack}</pre>
                                </details>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
