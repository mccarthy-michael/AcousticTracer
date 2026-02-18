import { type FallbackProps, ErrorBoundary } from "react-error-boundary";
import { useNavigate } from "react-router";

interface FeatureErrorFallbackProps extends FallbackProps {
  featureName: string;
}

function FeatureErrorFallback({
  error,
  resetErrorBoundary,
  featureName,
}: FeatureErrorFallbackProps) {
  const navigate = useNavigate();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-bg-primary p-4 text-text-primary">
      <div className="w-full max-w-md rounded-xl border border-yellow-500/20 bg-bg-card p-8 shadow-xl">
        <div className="mb-6 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-500/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-7 w-7 text-yellow-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
        </div>

        <h2 className="mb-2 text-center text-lg font-bold text-text-primary">
          {featureName} Error
        </h2>

        <p className="mb-4 text-center text-xs text-text-secondary">
          This feature encountered an error. You can try again or return to the
          dashboard.
        </p>

        {/* Error Details */}
        <div className="mb-4 max-h-24 overflow-y-auto rounded bg-black/20 p-2 font-mono text-xs text-yellow-400">
          {error instanceof Error ? error.message : String(error)}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={resetErrorBoundary}
            className="w-full rounded-lg bg-button-primary px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-button-hover focus:outline-none focus:ring-2 focus:ring-button-primary/50"
          >
            Try Again
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

interface FeatureErrorBoundaryProps {
  children: React.ReactNode;
  featureName: string;
}

export function FeatureErrorBoundary({
  children,
  featureName,
}: FeatureErrorBoundaryProps) {
  return (
    <ErrorBoundary
      FallbackComponent={(props) => (
        <FeatureErrorFallback {...props} featureName={featureName} />
      )}
      onReset={() => {
        window.location.reload();
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
