import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import { CartProvider } from "@/src/features/cart/context/CartContext";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    //bọc CartProvider quanh Header và nội dung trang Bọc vào để mọi component bên trong dùng chung được một con số giỏ hàng.Không bọc thì Header và nút “Thêm vào giỏ” không biết gì về nhau. Bọc rồi thì nút thêm giỏ báo “+1”, Header thấy ngay và hiện badge.
    <CartProvider>  
      <div className="flex min-h-screen flex-col">
        <Header />

        <main className="flex-1">
          {children}
        </main>

        <Footer />
      </div>
    </CartProvider>
  );
}