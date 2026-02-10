import { NextRequest } from 'next/server';
import Perplexity from '@perplexity-ai/perplexity_ai';
import fs from 'fs';
import path from 'path';
import { createClient } from '@/lib/supabase/server';
import { decryptApiKey } from '@/lib/encryption/crypto';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { topic, tabId } = await request.json();

    // Validate input
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Topic is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch user's encrypted API key from database
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('user_api_keys')
      .select('encrypted_api_key')
      .eq('user_id', session.user.id)
      .single();

    if (apiKeyError || !apiKeyData) {
      return new Response(
        JSON.stringify({
          error: 'No API key configured. Please add one in Settings.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Decrypt API key server-side
    const apiKey = decryptApiKey(apiKeyData.encrypted_api_key);

    // Initialize Perplexity client with user's API key
    const client = new Perplexity({ apiKey });

    // Read prompt template from file
    const promptPath = path.join(process.cwd(), 'prompt.txt');
    const promptTemplate = fs.readFileSync(promptPath, 'utf-8');
    const prompt = promptTemplate.replace('{topic}', topic.trim());

    // Create streaming chat completion
    const stream = await client.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'sonar',
      stream: true,
    });

    // Create ReadableStream for response
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    // Return streaming response
    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('API route error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch news' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
