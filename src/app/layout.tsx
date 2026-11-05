import type { Metadata } from "next";
import { Nunito_Sans, Oswald } from "next/font/google";
import "./globals.css";

const nunito = Nunito_Sans({ variable: "--font-nunito", subsets: ["latin"] });
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "DALS Estudos", template: "%s · DALS" },
  description: "Jornal DALS e DALS Estudos — Diretório Acadêmico Luiz Sobral, Medicina FMC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${nunito.variable} ${oswald.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
