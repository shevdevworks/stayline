import { EmptyState } from '@/components/EmptyState/EmptyState'
import { AlertTriangleIcon } from '@/components/icons/AlertTriangleIcon'

export interface VenueLoadErrorProps {
  onRetry: () => void
}

export function VenueLoadError({ onRetry }: VenueLoadErrorProps) {
  return (
    <EmptyState
      icon={<AlertTriangleIcon />}
      headingLevel={1}
      title="Something went wrong"
      description="This space couldn't be loaded. Check your connection and try again."
      action={{ label: 'Try again', onClick: onRetry }}
      link={{ label: 'Browse all spaces', to: '/' }}
    />
  )
}
