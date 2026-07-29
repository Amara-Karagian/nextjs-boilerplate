import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SafeHer — Because every woman deserves safety and dignity",
  description:
    "SafeHer provides real emergency numbers, resources, and support for women facing gender-based violence — in every language.",
};

// Runs before paint so the correct theme is applied with no flash of the wrong colors.
const themeInit = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
