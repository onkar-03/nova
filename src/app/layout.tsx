import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';

import { Toaster } from 'sonner';
import { TRPCReactProvider } from '@/trpc/client';

import './globals.css';
import { ThemeProvider } from 'next-themes';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Nova - AI Website Builder',
  description:
    'Create stunning websites and web applications through simple conversations with AI. No coding required - just describe your vision and watch Nova bring it to life instantly.',
  keywords: [
    'AI website builder',
    'no-code',
    'website creation',
    'AI website development',
    'conversational AI',
    'website design',
    'Nova',
  ],
  authors: [{ name: 'Nova Team' }],
  creator: 'Nova',
  publisher: 'Nova',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://buildwithnova.vercel.app',
    title: 'Nova - AI Website Builder',
    description:
      'Create stunning websites and web applications through simple conversations with AI. No coding required.',
    siteName: 'Nova',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nova - AI Website Builder',
    description:
      'Create stunning websites and web applications through simple conversations with AI. No coding required.',
    creator: '@nova',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Wrap the whole app with TRPC Provider from react
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#C96342',
        },
      }}
    >
      <TRPCReactProvider>
        <html lang='en' suppressHydrationWarning>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            <ThemeProvider
              attribute='class'
              defaultTheme='system'
              enableSystem
              disableTransitionOnChange
            >
              <Toaster />
              {children}
            </ThemeProvider>
          </body>
        </html>
      </TRPCReactProvider>
    </ClerkProvider>
  );
}
