import '@/app/ui/global.css';
import  { inter, lusitana } from '@/app/ui/fonts'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* bg-cyan-50 for background color here*/}
      <body className={`${inter.className} antialiased `} > 
        <div>{children}</div>
      </body>
    </html>
  );
}
