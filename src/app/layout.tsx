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
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 256 256%22 fill=%22%230072d6%22><path d=%22M128 32c-19.46 0-37.14 7.5-50.21 19.57a70 70 0 0 0-19.7 45.86L128 32zM58.09 97.43a70 70 0 0 0-26 49.88L94.7 93.18 58.09 97.43zM32.09 147.31a70 70 0 0 0 45.86 19.7L32.09 97.43v49.88zM97.43 197.91a70 70 0 0 0 49.88 26v-62.61l-49.88 45.75zM147.31 224a70 70 0 0 0 19.7-45.86l-69.88-16.86 49.88 62.72zM197.91 158.57a70 70 0 0 0 26-49.88l-62.61-2.3-16.86 69.88 53.47-17.7z%22 /></svg>',
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
