import { useRef, useState, type KeyboardEvent } from 'react'
import type { VenueImage } from '@/types'
import styles from './Gallery.module.css'

export interface GalleryProps {
  images: VenueImage[]
}

export function Gallery({ images }: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [focusedIndex, setFocusedIndex] = useState(0)
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([])

  function selectImage(index: number) {
    setSelectedIndex(index)
    setFocusedIndex(index)
  }

  function focusThumbnail(index: number) {
    setFocusedIndex(index)
    thumbnailRefs.current[index]?.focus()
  }

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

  return (
    <div className={styles.gallery}>
      <h2 className={styles.srOnly}>Photos</h2>
      <div className={styles.mainFrame}>
        <img
          src={images[selectedIndex].src}
          alt={images[selectedIndex].alt}
          width={1200}
          height={900}
          loading="eager"
          className={styles.mainImage}
        />
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
                  src={image.src}
                  alt=""
                  width={1200}
                  height={900}
                  loading="lazy"
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
