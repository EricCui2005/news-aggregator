import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { encryptApiKey } from '@/lib/encryption/crypto';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('user_api_keys')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ hasApiKey: false }, { status: 200 });
  }

  return NextResponse.json({ hasApiKey: true }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { apiKey } = await request.json();

  if (!apiKey || typeof apiKey !== 'string') {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 400 });
  }

  const encryptedKey = encryptApiKey(apiKey);

  // Upsert (insert or update)
  const { error } = await supabase.from('user_api_keys').upsert({
    user_id: session.user.id,
    encrypted_api_key: encryptedKey,
  });

  if (error) {
    console.error('Error saving API key:', error);
    return NextResponse.json(
      { error: 'Failed to save API key' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('user_api_keys')
    .delete()
    .eq('user_id', session.user.id);

  if (error) {
    console.error('Error deleting API key:', error);
    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
