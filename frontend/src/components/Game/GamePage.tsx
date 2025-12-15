import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import World from './World';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("GamePage Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'red', padding: '20px', background: 'white', zIndex: 9999, position: 'relative' }}>
          <h2>Something went wrong in the Game World.</h2>
          <pre>{this.state.error?.toString()}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

const GamePage: React.FC = () => {
  return (
    <ErrorBoundary>
      <World />
    </ErrorBoundary>
  );
};

export default GamePage;
