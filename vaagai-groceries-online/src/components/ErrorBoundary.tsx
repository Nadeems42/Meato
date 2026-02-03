import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./ui/button";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    private handleReset = () => {
        window.location.reload();
    };

    private handleGoHome = () => {
        window.location.href = "/";
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
                        <div className="h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="h-10 w-10 text-destructive" />
                        </div>

                        <h1 className="text-2xl font-black text-gray-900 mb-2">Oops! Something went wrong</h1>
                        <p className="text-gray-500 mb-8 leading-relaxed">
                            We've encountered an unexpected error. Don't worry, our team has been notified.
                        </p>

                        <div className="space-y-3">
                            <Button
                                onClick={this.handleReset}
                                className="w-full rounded-2xl h-12 font-bold flex items-center justify-center gap-2"
                            >
                                <RefreshCcw className="h-4 w-4" />
                                Try Again
                            </Button>

                            <Button
                                variant="outline"
                                onClick={this.handleGoHome}
                                className="w-full rounded-2xl h-12 font-bold border-gray-200 flex items-center justify-center gap-2"
                            >
                                <Home className="h-4 w-4" />
                                Go to Homepage
                            </Button>
                        </div>

                        {process.env.NODE_ENV === 'development' && (
                            <div className="mt-8 p-4 bg-slate-50 rounded-xl text-left overflow-auto max-h-40">
                                <p className="text-[10px] font-mono text-slate-500 whitespace-pre-wrap">
                                    {this.state.error?.stack}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
