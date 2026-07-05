"use client";

import "./globals.css";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
      <body style={{ backgroundColor: "#0f1422" }}>
        <AuthContextProvider>
          <FinanceContextProvider>
            <ToastContainer />
            {/* Komponen <Nav /> telah dihapus dari sini agar tidak muncul di halaman Sign In */}
            {children}
          </FinanceContextProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}