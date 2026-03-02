import { cn } from './ui/utils';

/**
 * Wraps page content with fade-in animation.
 * Use for new pages/modules for consistent entry animation.
 */
export function PageTransition({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-fade-in-up', className)}
      {...props}
    >
      {children}
    </div>
  );
}
