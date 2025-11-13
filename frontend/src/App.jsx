import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import './index.css'

// Pages
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/Register";
import Product from "./pages/product";
import Cart from "./pages/cart";
import Vendor from "./pages/vendor";
import Admin from "./pages/admin";

// NOTE: No BrowserRouter here. It is only in main.jsx.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Product />} />
      <Route path="/signin" element={<Login />} />
      <Route path="/signup" element={<Register />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/vendor" element={<Vendor />} />
      <Route path="/admin" element={<Admin />} />  
      {/* Aliases and fallback */}
      <Route path="/login" element={<Navigate to="/signin" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      {/* <Route path="/products" element={<Products />} /> */}
    </Routes>
  );
}