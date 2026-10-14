import { EmptyState } from '@/components/EmptyState/EmptyState'
import { MapPinOffIcon } from '@/components/icons/MapPinOffIcon'

export function VenueNotFound() {
  return (
    <EmptyState
      icon={<MapPinOffIcon />}
      headingLevel={1}
      title="Venue not found"
      description="There's no space at this address. It may have been renamed or removed from the demo catalog."
      link={{ label: 'Browse all spaces', to: '/' }}
    />
  )
}
