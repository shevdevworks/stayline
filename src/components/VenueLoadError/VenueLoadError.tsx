import { EmptyState } from '@/components/EmptyState/EmptyState'
import { AlertTriangleIcon } from '@/components/icons/AlertTriangleIcon'

export interface VenueLoadErrorProps {
  onRetry: () => void
}

export function VenueLoadError({ onRetry }: VenueLoadErrorProps) {
  return (
    <EmptyState
      icon={<AlertTriangleIcon />}
      title="Something went wrong"
      description="We couldn't load this venue right now. Please try again."
      action={{ label: 'Retry', onClick: onRetry }}
    />
  )
}
