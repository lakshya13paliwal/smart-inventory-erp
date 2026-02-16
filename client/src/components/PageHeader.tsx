import { NotificationsBell } from "./NotificationsBell";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-slate-500 mt-1 text-sm md:text-base">
            {description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <NotificationsBell />
        {children}
      </div>
    </div>
  );
}
