import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PDF to PowerPoint Converter",
  description: "Convert PDF files to editable PowerPoint presentations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
