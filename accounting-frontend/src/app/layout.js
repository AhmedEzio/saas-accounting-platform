import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Finora - Accounting Intelligence for the Modern Accountant",
  description: "Manage clients, automate invoices, track payments, and store documents in one powerful, AI-driven platform built for freelancers and SMBs.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#faf8fe] text-[#1a1b1f] font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
