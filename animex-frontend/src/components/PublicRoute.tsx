import { useAuth } from "../context/AuthContext";

export default function PublicRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    );
  }

  // always render - no auth check
  return <>{children}</>;
}
