/**
 * Global Error Boundary (Phase 29 - F44)
 * 
 * Catches all rendering errors, component crashes, and orchestrator failures
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Phase 29 - F44: Log error (sanitized, no user data)
    console.error('[GlobalErrorBoundary] Error caught:', {
      message: error.message,
      stack: error.stack?.substring(0, 200), // Truncate stack
      componentStack: errorInfo.componentStack?.substring(0, 200),
    });

    this.setState({
      error,
      errorInfo,
    });

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: sendToErrorTracking(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default cosmic fallback UI
      return (
        <div className="min-h-screen bg-gradient-to-b from-cosmic via-mystic to-cosmic flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="max-w-md w-full bg-cosmic/90 backdrop-blur-sm border border-gold/30 rounded-2xl p-8 text-center"
          >
            {/* Cosmic Mandala Spinner */}
            <motion.div
              className="w-24 h-24 mx-auto mb-6 border-4 border-gold/50 border-t-gold rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />

            <h1 className="text-2xl font-display font-bold text-gold mb-4">
              The Guru is reconnecting to the divine…
            </h1>

            <p className="text-white/70 mb-6">
              Cosmic energies are realigning. Please refresh the page to continue your spiritual journey.
            </p>

            <div className="flex gap-4 justify-center">
              <motion.button
                onClick={this.handleReset}
                className="px-6 py-3 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 rounded-lg font-heading transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try Again
              </motion.button>

              <motion.button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-lg font-heading transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Refresh Page
              </motion.button>
            </div>

            {/* Error details (always show in production for debugging) */}
            {this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-white/60 text-sm cursor-pointer mb-2">
                  Error Details
                </summary>
                <pre className="text-xs text-white/50 bg-black/20 p-4 rounded overflow-auto max-h-40">
                  <div className="font-bold mb-2">Error: {this.state.error.message}</div>
                  {this.state.error.stack && (
                    <div className="mt-2 text-xs">
                      <div className="font-semibold mb-1">Stack:</div>
                      {this.state.error.stack.substring(0, 1000)}
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div className="mt-2 text-xs">
                      <div className="font-semibold mb-1">Component Stack:</div>
                      {this.state.errorInfo.componentStack.substring(0, 500)}
                    </div>
                  )}
                </pre>
              </details>
            )}
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

