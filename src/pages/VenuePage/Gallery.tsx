import { useRef, useState, type KeyboardEvent } from 'react'
import { venueImageSrcSet } from '@/lib/image'
import { VENUE_IMAGE_HEIGHT, VENUE_IMAGE_WIDTH } from '@/types'
import type { VenueImage } from '@/types'
import styles from './Gallery.module.css'

export interface GalleryProps {
  images: VenueImage[]
}

const MAIN_SIZES = '(min-width: 80rem) 46rem, (min-width: 64rem) 60vw, calc(100vw - 2rem)'

export function Gallery({ images }: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  // The photo being replaced stays underneath while the new one fades in,
  // so switching never flashes an empty frame.
  const [previousIndex, setPreviousIndex] = useState<number | null>(null)
  const [focusedIndex, setFocusedIndex] = useState(0)
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([])

  function selectImage(index: number) {
    if (index !== selectedIndex) {
      setPreviousIndex(selectedIndex)
      setSelectedIndex(index)
    }
    setFocusedIndex(index)
  }

  function focusThumbnail(index: number) {
    setFocusedIndex(index)
    thumbnailRefs.current[index]?.focus()
  }

  // Roving tabindex: one tab stop for the strip, arrows move within it.
  function handleKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        focusThumbnail(Math.max(0, focusedIndex - 1))
        break
      case 'ArrowRight':
        event.preventDefault()
        focusThumbnail(Math.min(images.length - 1, focusedIndex + 1))
        break
      case 'Home':
        event.preventDefault()
        focusThumbnail(0)
        break
      case 'End':
        event.preventDefault()
        focusThumbnail(images.length - 1)
        break
    }
  }

  const selected = images[selectedIndex]
  const previous = previousIndex !== null ? images[previousIndex] : null

  return (
    <div className={styles.gallery}>
      <h2 className="sr-only">Photos</h2>
      <div className={styles.mainFrame}>
        {previous && (
          <img
            src={previous.src}
            srcSet={venueImageSrcSet(previous)}
            sizes={MAIN_SIZES}
            alt=""
            width={VENUE_IMAGE_WIDTH}
            height={VENUE_IMAGE_HEIGHT}
            className={styles.mainImage}
            aria-hidden="true"
          />
        )}
        <img
          key={selected.src}
          src={selected.src}
          srcSet={venueImageSrcSet(selected)}
          sizes={MAIN_SIZES}
          alt={selected.alt}
          width={VENUE_IMAGE_WIDTH}
          height={VENUE_IMAGE_HEIGHT}
          loading="eager"
          fetchPriority={previous === null ? 'high' : undefined}
          className={previous ? `${styles.mainImage} ${styles.fadeIn}` : styles.mainImage}
        />
        {images.length > 1 && (
          <p className={styles.counter} aria-hidden="true">
            {selectedIndex + 1} / {images.length}
          </p>
        )}
      </div>

      {images.length > 1 && (
        <ul className={styles.thumbnails} onKeyDown={handleKeyDown}>
          {images.map((image, index) => (
            <li key={image.src}>
              <button
                ref={(node) => {
                  thumbnailRefs.current[index] = node
                }}
                type="button"
                className={styles.thumbnailButton}
                tabIndex={focusedIndex === index ? 0 : -1}
                aria-current={selectedIndex === index || undefined}
                aria-label={`Show photo ${index + 1} of ${images.length}`}
                onClick={() => selectImage(index)}
              >
                <img
                  src={image.srcSmall}
                  alt=""
                  width={600}
                  height={400}
                  loading="lazy"
                  decoding="async"
                  className={styles.thumbnailImage}
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
