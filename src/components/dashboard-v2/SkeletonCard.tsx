import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonCardProps {
  hasHeader?: boolean;
  rows?: number;
  className?: string;
}

export function SkeletonCard({ hasHeader = true, rows = 3, className }: SkeletonCardProps) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-4 lg:p-6 ${className}`}>
      {hasHeader && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-md" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-3 w-16" />
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-2.5 w-2/3" />
            </div>
            <Skeleton className="h-6 w-12 rounded-full flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 lg:p-5">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-5 w-5 rounded-md" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
      <Skeleton className="h-8 w-20 mb-2" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-[200px] lg:h-[250px] w-full rounded-lg" />
    </div>
  );
}
