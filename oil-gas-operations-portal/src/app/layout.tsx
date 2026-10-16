import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'Oil & Gas Operations Portal — AI/ML Command Center',
  description: 'Complete upstream, midstream, downstream AI/ML operations portal with digital twins, IoT sensors, computer vision, and predictive analytics',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0e1a] text-gray-200 min-h-screen">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-72 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
