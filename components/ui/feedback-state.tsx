'use client';

import React from 'react';
import { AlertCircle, Inbox, Loader2 } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface StateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function LoadingState({
  title = 'Loading',
  description = 'Please wait while we prepare this for you.',
  className,
}: StateProps) {
  return (
    <div className={cn('flex min-h-44 flex-col items-center justify-center text-center', className)}>
      <Loader2 className="mb-4 h-6 w-6 animate-spin text-saffron" aria-hidden="true" />
      <p className="font-medium text-primary">{title}</p>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again.',
  action,
  className,
}: StateProps) {
  return (
    <div className={cn('flex min-h-44 flex-col items-center justify-center text-center', className)}>
      <AlertCircle className="mb-4 h-7 w-7 text-danger" aria-hidden="true" />
      <p className="font-medium text-primary">{title}</p>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function EmptyState({
  title = 'Nothing here yet',
  description = 'Your saved items will appear here.',
  action,
  className,
}: StateProps) {
  return (
    <div className={cn('flex min-h-44 flex-col items-center justify-center text-center', className)}>
      <Inbox className="mb-4 h-7 w-7 text-saffron" aria-hidden="true" />
      <p className="font-medium text-primary">{title}</p>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function RetryButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" onClick={onClick}>
      Try again
    </Button>
  );
}
