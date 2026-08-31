import { Component, type ErrorInfo, type ReactNode } from 'react';

interface DomainErrorBoundaryProps {
  children: ReactNode;
  fallback: (reset: () => void) => ReactNode;
}

interface DomainErrorBoundaryState {
  hasError: boolean;
}

export class DomainErrorBoundary extends Component<
  DomainErrorBoundaryProps,
  DomainErrorBoundaryState
> {
  state: DomainErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): DomainErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('AI LAB render interrupt', error, info.componentStack);
    }
  }

  private reset = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) return this.props.fallback(this.reset);
    return this.props.children;
  }
}
