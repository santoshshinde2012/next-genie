import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Databricks Genie Chat - Next.js Integration',
  description: 'End-to-end integration of Databricks Genie Conversation APIs with Next.js',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className="antialiased bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}

