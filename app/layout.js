"use client";

import "./globals.css";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"

import Nav from "@/components/molecules/nav";

import FinanceContextProvider from "@/library/store/financeContext";
import AuthContextProvider from "@/library/store/authContext";




export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.js. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body>
        <AuthContextProvider>
        <FinanceContextProvider>
          <ToastContainer/>
          <Nav />
          {children}
        </FinanceContextProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}
