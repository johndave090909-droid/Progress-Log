import { useRef } from 'react'
import styles from './ImageUploader.module.css'

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function ImageUploader({ images = [], onChange }) {
  const fileRef = useRef(null)
  const cameraRef = useRef(null)

  async function handleFiles(files) {
    const newImages = await Promise.all(Array.from(files).map(fileToBase64))
    onChange([...images, ...newImages])
  }

  function handleDrop(e) {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  function handleRemove(index) {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className={styles.field}>
      <div
        className={styles.dropzone}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {/* Hidden inputs */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <span className={styles.icon}>🖼️</span>
        <span className={styles.hint}>Drag & drop images here, or</span>

        <div className={styles.btnRow}>
          <button
            type="button"
            className={styles.uploadBtn}
            onClick={() => fileRef.current?.click()}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/>
            </svg>
            Upload File
          </button>
          <button
            type="button"
            className={styles.cameraBtn}
            onClick={() => cameraRef.current?.click()}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M12 15.2A3.2 3.2 0 1 0 12 8.8a3.2 3.2 0 0 0 0 6.4zm0-8.4a5.2 5.2 0 1 1 0 10.4A5.2 5.2 0 0 1 12 6.8zM9 2L7.17 4H4C2.9 4 2 4.9 2 6v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9z"/>
            </svg>
            Take Photo
          </button>
        </div>
      </div>

      {images.length > 0 && (
        <div className={styles.previewGrid}>
          {images.map((src, i) => (
            <div key={i} className={styles.previewItem}>
              <img src={src} alt={`preview-${i}`} />
              <button
                className={styles.removeBtn}
                type="button"
                onClick={() => handleRemove(i)}
                title="Remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
