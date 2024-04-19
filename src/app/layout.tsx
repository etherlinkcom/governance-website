import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { FooterPure, Header } from '@/app/components';
import { AntdRegistry } from '@ant-design/nextjs-registry';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Etherlink governance',
  description: 'Etherlink governance current state, history and analytics',
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased flex flex-col min-h-screen`}>
        <AntdRegistry>
          <Header />
          <main className="container grow flex flex-col">
            {children}
          </main>
          <FooterPure />
        </AntdRegistry>
      </body>
    </html >
  );
};


export default RootLayout;