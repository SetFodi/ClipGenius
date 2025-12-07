import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: clip, error } = await supabase
      .from('clips')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error || !clip) {
      return NextResponse.json({ error: 'Clip not found' }, { status: 404 })
    }

    // Get public URL if clip is ready
    let publicUrl = null
    if (clip.storage_path && clip.status === 'ready') {
      const { data } = supabase.storage
        .from('clips')
        .getPublicUrl(clip.storage_path)
      publicUrl = data.publicUrl
    }

    return NextResponse.json({ ...clip, publicUrl })
  } catch (error) {
    console.error('Error fetching clip:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get clip to check ownership and storage path
    const { data: clip, error: fetchError } = await supabase
      .from('clips')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !clip) {
      return NextResponse.json({ error: 'Clip not found' }, { status: 404 })
    }

    // Delete from storage if exists
    if (clip.storage_path) {
      await supabase.storage
        .from('clips')
        .remove([clip.storage_path])
    }

    // Delete clip record
    const { error: deleteError } = await supabase
      .from('clips')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting clip:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

