import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'Secure Aadhaar Unlocker',
  description: 'Unlock your Aadhaar PDF securely in the browser. Zero data upload.',
  themeColor: '#0f172a',
};

import { Navbar } from '@/components/ui/Navbar';
import { ThemeProvider } from '@/components/ui/theme-provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta 
          httpEquiv="Content-Security-Policy" 
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self'; worker-src 'self' blob:; object-src 'none'; img-src 'self' blob: data:;" 
        />
        <script src="/pdf.min.js" defer></script>
      </head>
      <body className={outfit.variable}>
        <ThemeProvider>
           <Navbar />
           {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
