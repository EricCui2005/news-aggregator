import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET all tabs for current user
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('tabs')
    .select('*')
    .eq('user_id', session.user.id)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching tabs:', error);
    return NextResponse.json({ error: 'Failed to fetch tabs' }, { status: 500 });
  }

  return NextResponse.json({ tabs: data }, { status: 200 });
}

// POST create new tab
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { topic } = await request.json();

  if (!topic || typeof topic !== 'string') {
    return NextResponse.json({ error: 'Invalid topic' }, { status: 400 });
  }

  // Get max display_order
  const { data: maxOrder } = await supabase
    .from('tabs')
    .select('display_order')
    .eq('user_id', session.user.id)
    .order('display_order', { ascending: false })
    .limit(1);

  const newOrder = maxOrder && maxOrder.length > 0 ? maxOrder[0].display_order + 1 : 0;

  const { data, error } = await supabase
    .from('tabs')
    .insert({
      user_id: session.user.id,
      topic,
      display_order: newOrder,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating tab:', error);
    return NextResponse.json({ error: 'Failed to create tab' }, { status: 500 });
  }

  return NextResponse.json({ tab: data }, { status: 201 });
}

// PATCH update tab
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { tabId, topic, lastRefreshedAt } = await request.json();

  const updates: any = {};
  if (topic !== undefined) updates.topic = topic;
  if (lastRefreshedAt !== undefined) updates.last_refreshed_at = lastRefreshedAt;

  const { data, error } = await supabase
    .from('tabs')
    .update(updates)
    .eq('id', tabId)
    .eq('user_id', session.user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating tab:', error);
    return NextResponse.json({ error: 'Failed to update tab' }, { status: 500 });
  }

  return NextResponse.json({ tab: data }, { status: 200 });
}

// DELETE tab
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const tabId = searchParams.get('tabId');

  if (!tabId) {
    return NextResponse.json({ error: 'Tab ID required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('tabs')
    .delete()
    .eq('id', tabId)
    .eq('user_id', session.user.id);

  if (error) {
    console.error('Error deleting tab:', error);
    return NextResponse.json({ error: 'Failed to delete tab' }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
