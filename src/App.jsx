import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "../src/pages/login";
import "./styles/App.css"; 
import Layout from "./components/layout";


export default function App() {
  return (
    <BrowserRouter>
    
      <Routes>

        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={ <Layout> 
          <Login/>
         </Layout> }
          />
          
        <Route path="/dashboard" element={ <dashboard />} />
      </Routes>

    </BrowserRouter>
  );
}
