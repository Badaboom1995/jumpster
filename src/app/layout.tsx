import type { PropsWithChildren } from "react";
import type { Metadata } from "next";
import "./_assets/globals.css";
import { Root } from "@/components/Root/Root";
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MovingGradient from "@/app/Back";
import { Inter } from "next/font/google";

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
    <html lang="en" className={inter.className}>
      <body className="bg-background-dark">
        <Root>
          {/*<div className='h-[100vh] fixed top-0 left-0 z-0'><MovingGradient/></div>*/}
          <div className="relative z-10 flex h-[100vh] flex-col overflow-hidden bg-opacity-10">
            <Header />
            <div className="grow pb-[80px]">{children}</div>
            <Footer />
          </div>
        </Root>
      </body>
    </html>
  );
}
