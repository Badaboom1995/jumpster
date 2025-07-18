import type { PropsWithChildren } from "react";
import type { Metadata } from "next";
import "./_assets/globals.css";
import { Root } from "@/components/Root/Root";
import React from "react";
import Footer from "@/components/Footer";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";

// If loading a variable font, you don't need to specify the font weight
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Your Application Title Goes Here",
  description: "Your application description goes here",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html
      lang="en"
      className={`${inter.className} relative mx-auto h-[100vh] w-full max-w-[500px] overflow-hidden`}
    >
      <body className="h-[100vh] w-full bg-background-dark">
        <Root>
          <div className="relative z-10 flex h-[100vh] flex-col overflow-hidden bg-opacity-10">
            <div className="grow pb-[80px]">{children}</div>
            <Footer />
          </div>
        </Root>
        <Toaster />
      </body>
    </html>
  );
}
