import { UserProvider } from "@/features/auth/context/user-store";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary"
import { MainErrorFallback } from "@/components/main-error-fallback";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
const queryClient = new QueryClient();

interface AppProviderProps{
    children: React.ReactNode
}

export const AppProvider = ({ children }: AppProviderProps ) => {
    return (
        <ErrorBoundary FallbackComponent={MainErrorFallback}>
            <Suspense fallback={
                <div className="flex h-screen items-center justify-center">
                    Loading App.
                </div>
            }
            >
                <QueryClientProvider client={queryClient}>
                    <UserProvider>
                        {children}
                    </UserProvider>
                </QueryClientProvider>
            </Suspense>
        </ErrorBoundary>
    )
}
