"use client";
import { useEffect, useState } from "react";
import { Brand } from "../types/brand";
import { getBrand } from "../services/brand.service";


export default function useBrands(){
    const [brands, setBrands] = useState<Brand[]>([]);
    const[loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const featchBrands = async () => {
            try{
                setLoading(true);
                setError("");

                const data = await getBrand();
                setBrands(data);
            }catch(error){
                console.error("Failed to get brands", error);
                setError("Failed to loading brands");
            }finally{
                setLoading(false)
            }
        }
        featchBrands()
    },[])
    return{
        brands,
        loading,
        error
    }
}