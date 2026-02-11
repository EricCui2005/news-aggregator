# AI News Aggregator

A modern, multi-user news aggregation platform powered by Perplexity AI. Organize topics into tabs and get AI-generated summaries of recent developments with real-time streaming responses.

## Features

- **Google OAuth Authentication** - Secure sign-in with Google
- **Multi-Tab Interface** - Organize different topics in separate tabs
- **Real-Time Streaming** - Watch AI responses generate in real-time
- **Per-User API Keys** - Each user securely stores their own Perplexity API key
- **Markdown Rendering** - Rich text formatting with clickable source links
- **Custom Prompts** - Modify the prompt template to customize AI responses
- **Dark Mode UI** - Sleek, modern interface with blue and black color palette

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth with Google OAuth
- **Database**: Supabase (PostgreSQL)
- **AI**: Perplexity AI API
- **Deployment**: Vercel-ready

## Prerequisites

- Node.js 18+
- A Supabase account
- A Perplexity API key
- Google OAuth credentials

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/EricCui2005/news-aggregator.git
cd news-aggregator
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Supabase

Follow the complete setup guide in [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) to:
- Create a Supabase project
- Run the database schema
- Configure Google OAuth
- Get your environment variables

### 4. Set up environment variables

Create a `.env.local` file:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Encryption (32 characters)
ENCRYPTION_SECRET=your-32-character-secret
```

Generate the encryption secret:
```bash
openssl rand -base64 32 | head -c 32
```

### 5. Run the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Usage

1. **Sign in** with your Google account
2. **Add your Perplexity API key** in Settings
3. **Create tabs** for different topics you want to track
4. **Enter a topic** and click "Refresh News" to get AI-generated summaries
5. **Switch between tabs** to view different topics

## Custom Prompts

Edit `prompt.txt` to customize how the AI responds to your queries. Use `{topic}` as a placeholder for the user's input.

## Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/EricCui2005/news-aggregator)

Remember to add your environment variables in the Vercel dashboard.

## Security

- API keys are encrypted with AES-256 before storage
- Row Level Security (RLS) ensures users can only access their own data
- All API routes are protected with authentication middleware
- Sensitive operations are server-side only

## License

MIT
