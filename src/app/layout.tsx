import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import AuthProtecter from '@/components/auth/AuthProtector';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { config } from '@/lib/config';
import Script from 'next/script'
import { NotificationProvider } from '@/components/ui/Notification';

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: config.app.name,
  description: 'Get to know your license type!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className='w-full h-full'>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased w-full h-full`}>
        <NotificationProvider>
          <AuthProvider>
            <AuthProtecter>
              {children}
            </AuthProtecter>
            <Script src="https://accounts.google.com/gsi/client"/>
          </AuthProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
