import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI News Aggregator',
  description: 'Get recent developments on any topic powered by Perplexity AI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
