import './globals.css';
import { Toaster } from 'react-hot-toast';
import ThemeProvider from '@/components/providers/ThemeProvider';

export const metadata = {
  title: 'ChatFlow',
  description: 'Modern team communication',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-[#1a1d21] text-gray-900 dark:text-gray-100">
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { background: '#363636', color: '#fff' },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
