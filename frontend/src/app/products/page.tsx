"use client";

import { useEffect, useState } from "react";

import ProductCard from "@/src/features/product/components/ProductCard";
import { getProducts, ProductSort } from "@/src/features/product/services/product.service";
import type { Product } from "@/src/features/product/types/product";
import { getCategories } from "@/src/features/category/services/category.service";
import { Category } from "@/src/features/category/types/category";
import { Brand } from "@/src/features/brand/types/brand";
import { getBrand } from "@/src/features/brand/services/brand.service";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Category[]>([]); //categories → toàn bộ danh sách category lấy từ backend
  const [categoryId, setCategoryId] = useState("");// categoryId → category mà người dùng đang chọn
  const [products, setProducts] = useState<Product[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [brands, setBrands] = useState<Brand[]>([]); // Brands -> toàn bộ danh sách brands lấy từ backend
  const [brandId, setBrandId]= useState("");// brandId -> brand mà người dùng đang chọn
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<ProductSort | "">("");
  const [page, setPage] = useState(1);
  const[pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchProducts = async () => {
        try {
          setLoading(true);
          setError("");

          const data = await getProducts({
            search: search || undefined,
            sort: sort || undefined,
            categoryId: categoryId ?Number(categoryId): undefined,
            brandId: brandId ?Number(brandId): undefined,
            minPrice: minPrice ?Number(minPrice): undefined,
            maxPrice: maxPrice ?Number(maxPrice): undefined,
            page,
            limit: 12,
          });

          setProducts(data.products);
          setPagination(data.pagination);
        } catch (error) {
          console.error("Failed to get products:", error);
          setError("Failed to load products.");
        } finally {
          setLoading(false);
        }
      };

      fetchProducts();
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [search, sort, categoryId, brandId, minPrice, maxPrice, page]); 

  useEffect(() => {
    const fetchCategories = async () => {
      try{
        const data = await getCategories();
        setCategories(data);
      } catch(error){
        console.log("Failed to get categories", error);
      }
    };

    fetchCategories()
  }, [])
    
  useEffect(() => {
      const fetchBrands = async () =>{
        try{
          const data = await getBrand();
          setBrands(data);
        }catch(error){
          console.error("Falied to get brands", error)
        }
      }
      fetchBrands();
  },[])




 return (
  <main className="mx-auto max-w-7xl p-6">
    <h1 className="text-3xl font-bold">          
      Products
    </h1>

    {/* Search */}
    <input
      type="text"
      value={search}
       onChange={(e) => {
        setSearch(e.target.value);
        setPage(1);
      }}
      placeholder="Search products..."
      className="mt-6 w-full rounded border p-2"
    />

    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {/* Category */}
      <select
        value={categoryId}
        onChange={(e) => {
          setCategoryId(e.target.value);
          setPage(1);
        }}
        className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-black"
      >
        <option value="" disabled hidden>
          Category
        </option>

        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      {/* Brand */}
      <select
        value={brandId}
       onChange={(e) => {
        setBrandId(e.target.value);
        setPage(1);
       }}
        className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-black"
      >
        <option value="" disabled hidden>
          Brand
        </option>

        {brands.map((brand) => (
          <option key={brand.id} value={brand.id}>
            {brand.name}
          </option>
        ))}
      </select>

      {/* Min Price */}
      <input
        type="number"
        value={minPrice}
        onChange={(e) => {
          setMinPrice(e.target.value);
          setPage(1);
        }}
        placeholder="Min price"
        className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-black"
      />

      {/* Max Price */}
      <input
        type="number"
        value={maxPrice}
        onChange={(e) => {
          setMaxPrice(e.target.value);
          setPage(1);
        }}
        placeholder="Max price"
        className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-black"
      />

      {/* Sort */}
      <select
        value={sort}
        onChange={(e) => {
          setSort(e.target.value as ProductSort | "");
          setPage(1);
        }}
        className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-black"
      >
        <option value="" disabled hidden>
          Sort by
        </option>

        <option value="newest">Newest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>

    {/* Products */}
    <div className="mt-6">
      {loading ? (
        <p>
          {search
            ? "Searching..."
            : "Loading products..."}
        </p>
      ) : error ? (
        <p className="text-red-500">
          {error}
        </p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">
          No products found .
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              price={product.price}
              salePrice={product.salePrice}
              image={product.images?.[0]?.url}
              slug={product.slug}
            />
          ))}
        </div>
      )}
    </div>

    <div className="mt-8 flex items-center justify-center gap-2">
      {Array.from(
        { length: pagination.totalPages },
        (_, index) => index + 1
      ).map((pageNumber) => (
        <button
            key={pageNumber}
            onClick={() => setPage(pageNumber)}
            className={`rounded border px-3 py-2 ${
              page === pageNumber
                ? "bg-black text-white"
                : "bg-white text-black"
            }`}
          >
            {pageNumber}
      </button>
      ))}
    </div>
  </main>
);
}