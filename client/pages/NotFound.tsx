import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl flex flex-col items-center justify-center px-4 py-12 text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-lg text-muted-foreground mb-2">Page not found</p>
        <p className="text-sm text-muted-foreground mb-6">
          The page you're looking for doesn't exist
        </p>
        <Link
          to="/"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-subtle hover:opacity-90"
        >
          Return to Dashboard
        </Link>
      </div>
    </AppLayout>
  );
};

export default NotFound;
