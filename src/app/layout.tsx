import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'PDF Editx | Secure PDF & Image Suite',
  description: 'A premium, privacy-focused web application for managing PDF and Image files securely in your browser. All processing happens locally on your device—no files are ever uploaded to a server.',
  icons: {
    icon: '/logo.png',
  },
};

export const viewport = {
  themeColor: '#0f172a',
};

import { Navbar } from '@/components/ui/Navbar';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { ToastProvider } from '@/components/ui/toast-provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* RESOURCE: Paste your Google Search Console verification meta tag below this line */}
        <meta name="google-site-verification" content="xGevfp3B3CvlIc2uO-GrTSf7vr6XO6V5Y6UL0UPOnIE" />
        <meta 
          httpEquiv="Content-Security-Policy" 
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self'; worker-src 'self' blob:; object-src 'none'; img-src 'self' blob: data:;" 
        />
        <script src="/pdf.min.js" defer></script>
      </head>
      <body className={outfit.variable}>
        <ThemeProvider>
          <ToastProvider>
           <Navbar />
           {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
