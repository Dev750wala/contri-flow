import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Providers } from './provider';
import CryzeoAnimatedBackground from '@/components/CryzeoAnimatedBackground';

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
// });

export const metadata: Metadata = {
  title: 'ContriFlow',
  description: 'Created by Dev Sadisatsowala',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body>
          <CryzeoAnimatedBackground />
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <div className="relative z-10 min-h-screen">
              {children}
            </div>
          </ThemeProvider>
        </body>
      </html>
    </Providers>
  );
}