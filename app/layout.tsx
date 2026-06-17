import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BookVoice — Personal Audiobook Reader",
  description: "Drop a PDF, assign unique voices to each chapter, and listen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
