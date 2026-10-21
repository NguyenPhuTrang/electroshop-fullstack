export type ProductStatus = "ACTIVE" | "INACTIVE";

export type ProductVariantStatus =
    | "ACTIVE"
    | "INACTIVE"
    | "OUT_OF_STOCK";

export interface ProductColor {
    id: number;
    productId: number;
    name: string;
    hexCode: string | null;
    sortOrder: number;
    createdAt?: string;
    updatedAt?: string;
}
export interface ProductImage {
    id: number;
    productId: number;
    url: string;
    alt: string | null;
    colorId: number | null;
    colorOption?: ProductColor | null;
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
export interface ProductVariant {
    id: number;
    productId: number;
    sku: string;
    storage: string | null;
    colorId: number | null;
    colorOption: ProductColor | null;
    price: string;
    salePrice: string | null;
    stock: number;
    status: ProductVariantStatus;
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
    description: string | null;
    videoUrl: string | null;
    videoPublicId: string | null;
    status: ProductStatus;
    createdAt: string;
    updatedAt: string;

    brand: ProductBrand;
    category: ProductCategory;
    images: ProductImage[];

    price?: string | null;
    salePrice?: string | null;
    stock?: number;

    variants?: ProductVariant[];
}

export interface ProductWithVariantSummary extends Product {
    price: string | null;
    salePrice: string | null;
    stock: number;
    variants: ProductVariant[];
}