export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { nanoid } from 'nanoid'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'uploads'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Limit upload file size to 10MB
    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 })
    }

    const admin = getSupabaseAdmin()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasSupabase = admin && supabaseUrl && !supabaseUrl.includes('placeholder')

    if (hasSupabase) {
      const bucketName = 'events'

      // Ensure bucket exists
      try {
        const { data: buckets } = await admin.storage.listBuckets()
        const bucketExists = buckets?.some((b) => b.name === bucketName)
        if (!bucketExists) {
          await admin.storage.createBucket(bucketName, { public: true })
        }
      } catch (bucketErr) {
        console.warn('[Upload] Could not list/create bucket, attempting direct upload:', bucketErr)
      }

      // Generate clean path
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const cleanFileName = `${folder}/${Date.now()}-${nanoid(8)}.${ext}`
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const { data, error } = await admin.storage
        .from(bucketName)
        .upload(cleanFileName, buffer, {
          contentType: file.type || 'image/jpeg',
          upsert: true,
        })

      if (error) {
        console.error('[Upload] Supabase Storage upload error:', error.message)
        return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 })
      }

      const { data: publicUrlData } = admin.storage.from(bucketName).getPublicUrl(cleanFileName)

      return NextResponse.json({
        success: true,
        url: publicUrlData.publicUrl,
        path: cleanFileName,
      })
    }

    // Fallback if Supabase is not configured (e.g. local development preview)
    // Return a lightweight placeholder or data URL only in non-configured dev
    return NextResponse.json({
      error: 'Supabase storage is not configured. Please verify SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL.',
    }, { status: 503 })
  } catch (error: any) {
    console.error('[Upload] Unexpected error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to upload image' },
      { status: 500 }
    )
  }
}
