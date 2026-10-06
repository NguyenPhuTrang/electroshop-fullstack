"use client";

import { useEffect, useState } from "react";
import { Address } from "../types/address";
import { getAdminAddresses } from "../services/address.service";


export function useAdminUserAddresses(userId: number) {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

  useEffect(() => {
    if (!Number.isInteger(userId) || userId <= 0) {
        return;
    }

        let cancelled = false;

        const fetchAddresses = async () => {
            try {
                const data = await getAdminAddresses(userId);

                if (!cancelled) {
                    setAddresses(data);
                    setError("");
                }
            } catch (error) {
                console.error(
                    "Failed to get user addresses",
                    error
                );

                if (!cancelled) {
                    setError("Failed to load addresses");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchAddresses();

        return () => {
            cancelled = true;
        };
    }, [userId]);

    return {
        addresses,
        loading,
        error,
    };
}