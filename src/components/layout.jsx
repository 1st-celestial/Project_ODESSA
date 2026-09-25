import React from "react";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ marginTop: "-80px", minHeight: "calc(100vh + 160px)" }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
