import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

/**
 * Catches render-time errors after a route mounts (e.g. a stale chunk imported
 * after a deploy). Lazy *rejections* (before mount) are caught by the router's
 * errorElement instead (ChunkErrorElement).
 */
export class ChunkErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="text-text-secondary text-sm">
            No se pudo cargar el módulo. Puede deberse a una versión nueva publicada.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-btn-primary-bg hover:bg-btn-primary-bg-hover text-btn-primary-fg rounded-md px-4 py-1.5 text-sm font-medium"
          >
            Recargar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
