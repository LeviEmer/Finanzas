import { Component, type ReactNode } from "react";

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Unhandled application error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">Algo salió mal</p>
            <p className="text-sm text-neutral-500">
              Ocurrió un error inesperado. Tus datos están seguros en este
              dispositivo. Intenta recargar la app.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
