import type { Metadata } from "next";
import { Nunito_Sans, Oswald } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

const nunito = Nunito_Sans({ variable: "--font-nunito", subsets: ["latin"] });
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DALS Questões",
  description: "Banco de questões do Diretório Acadêmico Luiz Sobral — Medicina FMC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${nunito.variable} ${oswald.variable} font-sans antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
