/**
 * Uploads an image File or Blob to Supabase Storage via /api/upload
 * Returns the public CDN URL of the uploaded image.
 */
export async function uploadImageFile(file: File, folder: string = 'events'): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  const data = await res.json()

  if (!res.ok || !data.success || !data.url) {
    throw new Error(data.error || 'Failed to upload image')
  }

  return data.url
}
