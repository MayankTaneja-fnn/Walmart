import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { AuthProvider } from '@/context/auth-context';

export const metadata: Metadata = {
  title: 'Walmart',
  description: 'Shop smart, save the planet.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22><rect width=%2224%22 height=%2224%22 fill=%22%230072d6%22/><path fill=%22%23ffc220%22 d=%22M13.33 6.45l-1.9 4.48-4.48 1.9 4.48 1.9 1.9 4.48 1.9-4.48 4.48-1.9-4.48-1.9-1.9-4.48zM5.52 1.48l-1.04 2.45-2.45 1.04 2.45 1.04 1.04 2.45 1.04-2.45 2.45-1.04-2.45-1.04-1.04-2.45zM21.48 15.52l-1.04 2.45-2.45 1.04 2.45 1.04 1.04 2.45 1.04-2.45 2.45-1.04-2.45-1.04-1.04-2.45z%22/></svg>',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;700&family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <AuthProvider>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
