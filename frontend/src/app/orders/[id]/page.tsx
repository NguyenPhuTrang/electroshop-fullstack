import { OrderStatusSection } from "@/src/features/order/components/OrderStatusSection";
import { getOrderById } from "@/src/features/order/services/order.service.server";


type OrderDetailPageProps = {
    //params  chứa tham số động lấy từ url bọc trong promise phải chờ await chạy xong mới lấy được giá trị
    params: Promise<{   
        id: string
    }>;
};

export default async function OrderDetailPage({
    params
}: OrderDetailPageProps){
    const {id} = await params;

    const orderId = Number(id);

    const order = await getOrderById(orderId);

     return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-3xl font-bold">
        Order Detail
      </h1>

      {/* Order information */}
      <OrderStatusSection
        orderId={order.id}
        orderNumber={order.orderNumber}
        initialStatus={order.status}
        />

      {/* Shipping */}
      <section className="mt-6 rounded border p-6">
        <h2 className="text-xl font-semibold">
          Shipping Information
        </h2>

        <div className="mt-4 space-y-2">
          <p>Name: {order.shippingName}</p>
          <p>Phone: {order.shippingPhone}</p>
          <p>Address: {order.shippingAddress}</p>
          <p>City: {order.shippingCity}</p>
          <p>District: {order.shippingDistrict}</p>

          {order.note && (
            <p>Note: {order.note}</p>
          )}
        </div>
      </section>

      {/* Products */}
      <section className="mt-6 rounded border p-6">
        <h2 className="text-xl font-semibold">
          Products
        </h2>

        <div className="mt-4 space-y-4">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between border-b pb-4"
            >
              <div>
                <p className="font-semibold">
                  {item.productName}
                </p>

                <p className="text-sm text-gray-500">
                  Quantity: {item.quantity}
                </p>

                <p className="text-sm text-gray-500">
                  SKU: {item.productSku}
                </p>
              </div>

              <p>
                {Number(item.subtotal).toLocaleString("vi-VN")} VND
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Payment */}
      <section className="mt-6 rounded border p-6">
        <h2 className="text-xl font-semibold">
          Payment
        </h2>

        {order.payment && (
          <div className="mt-4 space-y-2">
            <p>
              Method: {order.payment.method}
            </p>

            <p>
              Status: {order.payment.status}
            </p>

            <p>
              Amount:{" "}
              {Number(order.payment.amount).toLocaleString("vi-VN")} VND
            </p>
          </div>
        )}
      </section>

      {/* Total */}
      <section className="mt-6 rounded border p-6">
        <div className="space-y-2 text-right">
          <p>
            Subtotal:{" "}
            {Number(order.subtotal).toLocaleString("vi-VN")} VND
          </p>

          <p>
            Shipping Fee:{" "}
            {Number(order.shippingFee).toLocaleString("vi-VN")} VND
          </p>

          <p>
            Discount:{" "}
            {Number(order.discount).toLocaleString("vi-VN")} VND
          </p>

          <p className="text-xl font-bold">
            Total:{" "}
            {Number(order.total).toLocaleString("vi-VN")} VND
          </p>
        </div>
      </section>
    </main>
  );
}
