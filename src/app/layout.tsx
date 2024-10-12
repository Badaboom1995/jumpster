import type { PropsWithChildren } from 'react';
import type { Metadata } from 'next';
import './_assets/globals.css';
import {Root} from "@/components/Root/Root";
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MovingGradient from "@/app/Back";

export const metadata: Metadata = {
  title: 'Your Application Title Goes Here',
  description: 'Your application description goes here',
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
    <body>
    <Root>
      <div className='fixed top-0 left-0 z-0'><MovingGradient/></div>
      <div className='flex flex-col h-[100vh] bg-background relative z-10 bg-opacity-10'>
        <Header/>
        <div className='grow'>{children}</div>
        <Footer/>
      </div>
    </Root>
    </body>
    </html>
  );
}
