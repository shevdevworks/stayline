import type { VenueImage } from '@/types'

export function venueImageSrcSet(image: VenueImage): string {
  return `${image.srcSmall} 600w, ${image.src} 1200w`
}
