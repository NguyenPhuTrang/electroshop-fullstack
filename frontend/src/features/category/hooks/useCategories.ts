"use client";
import { useEffect, useState } from "react";
import { Category } from "../types/category";
import { getCategories } from "../services/category.service";

export function useCategories(){
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(()=> {
        const fetchCategories = async () => {
            try{
                setLoading(true);
                setError("");
                const data = await getCategories();

                setCategories(data)
            } catch(error){
                console.error("Failed to get catagories:", error);
                setError("Failed to load categories");
            } finally{
                setLoading(false)
            }
        }
        fetchCategories()
    },[])

    return{
        categories,
        loading,
        error
    }
}