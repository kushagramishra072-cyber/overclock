import { AppLayout } from "@/components/AppLayout";
import { Link } from "react-router-dom";

interface PlaceholderProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function Placeholder({ title, description, icon }: PlaceholderProps) {
  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          {icon && <div className="text-primary/50 scale-150">{icon}</div>}
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-subtle hover:opacity-90"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
