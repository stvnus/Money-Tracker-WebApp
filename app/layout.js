"use client";

import "./globals.css";

import Nav from "@/components/molecules/nav";

import FinanceContextProvider from "@/library/store/financeContext";

export const metadata = {
  title: 'Financial Tool ',
  description: 'Generated by create next app',
} 

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.js. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body>
        <FinanceContextProvider>
          <Nav />
          {children}
        </FinanceContextProvider>
      </body>
    </html>
  );
}
