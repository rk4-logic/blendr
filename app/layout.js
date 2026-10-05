import "./globals.css";

export const metadata = {
  title: "Blendr — Build Your Own Smoothie",
  description:
    "Scan, build, and watch your smoothie come together — pick your cup, fruits, liquid base and nutrition boosts, then order fresh in minutes.",
  openGraph: {
    title: "Blendr — Build Your Own Smoothie",
    description: "Customize your smoothie and watch it get made, live.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
