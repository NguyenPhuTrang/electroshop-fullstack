"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getProductSpecifications,
  type ProductSpecification,
} from "../services/product-specification.service";

export function useProductSpecifications(
  productId: number | null | undefined
) {
  const [specifications, setSpecifications] = useState<
    ProductSpecification[]
  >([]);

  const [loading, setLoading] = useState(
    productId != null &&
      Number.isInteger(productId) &&
      productId > 0
  );

  const [error, setError] = useState("");

  const requestIdRef = useRef(0);

  const fetchSpecifications = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    if (
      productId == null ||
      !Number.isInteger(productId) ||
      productId <= 0
    ) {
      setSpecifications([]);
      setLoading(false);
      setError("");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getProductSpecifications(productId);

      if (requestId !== requestIdRef.current) {
        return;
      }

      setSpecifications(data);
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      console.error(
        "Failed to get product specifications",
        error
      );

      setSpecifications([]);
      setError("Failed to load product specifications");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [productId]);

  useEffect(() => {
    void fetchSpecifications();

    return () => {
   
      requestIdRef.current += 1;
    };
  }, [fetchSpecifications]);

  return {
    specifications,
    loading,
    error,
    refetch: fetchSpecifications,
  };
}