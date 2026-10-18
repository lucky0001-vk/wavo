'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
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
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-cinema-950">
          <div className="max-w-md w-full bg-cinema-850 border border-cinema-700/60 rounded-2xl p-8 text-center shadow-cinema-card">
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <AlertCircle size={28} />
            </div>

            <h3 className="text-xl font-semibold text-cinema-50 mb-2">
              {this.props.fallbackTitle || "We're having trouble connecting."}
            </h3>

            <p className="text-sm text-cinema-400 leading-relaxed mb-6">
              {this.props.fallbackMessage ||
                "Movie data or real-time session encountered a temporary interruption. Don't worry, your saved movies and watchlist are safe."}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-cinema hover:bg-amber-hover text-cinema-950 font-medium transition-all duration-200 text-sm"
              >
                <RefreshCw size={16} />
                Try Again
              </button>

              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cinema-800 hover:bg-cinema-750 text-cinema-200 hover:text-white border border-cinema-700/50 transition-all duration-200 text-sm"
              >
                <Home size={16} />
                Return to Discover
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
