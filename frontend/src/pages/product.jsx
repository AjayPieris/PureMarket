import React, { useState } from "react";
import Navbar from "../components/navbar";
import Card from "../components/productCard";
import Footer from "../components/footer";

export default function Product() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("name");

  return (
    <>
      <Navbar />
      {/* Page Container */}
      <div className="min-h-screen bg-gray-50 py-10 px-6">
        <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-md">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
            🛍️ All Products
          </h1>

          {/* Search + Filters */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 md:w-80 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-40"
            />

            {/* Category Filter */}
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-48 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-40"
            >
              <option value="">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Fashion">Fashion</option>
              <option value="Sports">Sports</option>
              <option value="Home">Home</option>
            </select>

            {/* Sort Filter */}
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-48 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-40"
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {/* Product list */}
          <div className="text-center text-gray-500">
            <Card searchQuery={searchQuery} category={category} sort={sort} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}