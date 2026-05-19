import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Gasoek_One, Geist } from "next/font/google";
import { BackgroundMusicController } from "./background-music-controller";
import { localeCookieName, normalizeLocale } from "./i18n";
import "./globals.css";

const gasoekOne = Gasoek_One({
  variable: "--font-gasoek-one",
  subsets: ["latin"],
  weight: "400",
});

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Word Picture Matching",
  description: "Game edukasi mencocokkan kata dan gambar untuk anak-anak.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(localeCookieName)?.value);

  return (
    <html lang={locale} className={`${gasoekOne.variable} ${geist.variable} h-full antialiased`}>
      <body className="min-h-full">
        {children}
        <BackgroundMusicController />
      </body>
    </html>
  );
}
