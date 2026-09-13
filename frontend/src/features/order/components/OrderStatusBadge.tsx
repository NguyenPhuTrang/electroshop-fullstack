import { Order } from "../types/order";

type OrderStatusBadgeProps = {
    status: Order["status"];
};

export default function OrderStatusBadge({
    status,
}: OrderStatusBadgeProps){
    return(
         <span className="rounded border px-3 py-1 text-sm font-medium">
      {status}
    </span>
    )
}