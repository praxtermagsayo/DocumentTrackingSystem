import { cn } from './utils';

/**
 * Skeleton with shimmer effect for loading states.
 * Use across the app for consistent loading placeholders.
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('skeleton', className)}
      {...props}
    />
  );
}

/** Skeleton row for table loading - matches typical table cell height */
export function SkeletonRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="animate-fade-in">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className="h-4 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}

/** Skeleton card - for dashboard/metric cards */
export function SkeletonCard() {
  return (
    <div className="rounded-xl border p-6 animate-fade-in-up" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="h-12 w-12 rounded-lg" />
      </div>
      <Skeleton className="h-4 w-20 mb-2" />
      <Skeleton className="h-3 w-24 mb-1" />
      <Skeleton className="h-8 w-16" />
    </div>
  );
}
