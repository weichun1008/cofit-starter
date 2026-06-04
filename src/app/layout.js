import "./globals.css";
import ClientLayout from "./ClientLayout";
import { APP } from "@/app/lib/config";

export const metadata = {
  title: APP.name,
  description: APP.description,
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang={APP.lang} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content={APP.themeColor} />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body suppressHydrationWarning>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
