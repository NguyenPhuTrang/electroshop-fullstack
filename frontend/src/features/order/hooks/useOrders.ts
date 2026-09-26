"use client"
import { useEffect, useState } from "react";
import { Order } from "../types/order";
import { getOrders } from "../services/order.service";

export function useOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() =>{
        const featchOrders = async () =>{
            try{
                const data = await getOrders();
                setOrders(data);
            } catch(error){
                console.log("Failed to get orders", error);
            }finally{
                setLoading(false)
            }
        };
        featchOrders();
    },[])

    return{
        orders,
        loading
    }
}