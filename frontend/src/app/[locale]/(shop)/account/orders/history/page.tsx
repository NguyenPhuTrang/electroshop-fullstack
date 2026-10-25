import { getTranslations } from "next-intl/server";

import { OrderHistory } from "@/src/features/order/components/OrderHistory";

export default async function OrderHistoryPage() {
  const t = await getTranslations("OrderHistoryPage");

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-3xl font-bold">
        {t("title")}
      </h1>

      <div className="mt-6">
        <OrderHistory />
      </div>
    </main>
  );
}