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
  const inputRef = useRef(null)

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
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
        />
        <span className={styles.icon}>📷</span>
        <span className={styles.hint}>
          <strong>Click to upload</strong> or drag & drop images here
        </span>
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
