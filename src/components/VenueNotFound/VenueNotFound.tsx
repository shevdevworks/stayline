import { EmptyState } from '@/components/EmptyState/EmptyState'
import { MapPinOffIcon } from '@/components/icons/MapPinOffIcon'

export function VenueNotFound() {
  return (
    <EmptyState
      icon={<MapPinOffIcon />}
      title="Venue not found"
      description="This venue doesn't exist or may have been removed."
      link={{ label: 'Back to catalog', to: '/' }}
    />
  )
}
