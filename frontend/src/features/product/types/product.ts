export interface ProductImage {
    id: number;
    productId: number;
    url: string;
    alt: string | null;
    isPrimary: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}

export interface ProductBrand {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    logo: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ProductCategory {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Product {
    id: number;
    categoryId: number;
    brandId: number;
    name: string;
    slug: string;
    sku: string;
    description: string;
    price: string;
    salePrice: string | null;
    stock: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    brand: ProductBrand;
    category: ProductCategory;
    images: ProductImage[];
}