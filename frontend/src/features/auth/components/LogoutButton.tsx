"use client"

import { useRouter } from "next/navigation";
import { logout } from "../services/auth.service";
import { clearAccessToken } from "../services/auth-token";
import { useUser } from "@/src/hooks/useUser";

export default function LogoutButton() {
    const router = useRouter();
    const { setUser } = useUser(); // lấy hàm setUser ra khỏi UserProvider để LogoutButton có thể thay đổi state user.
    
    

    const handleLogout = async () => {
        try{
            await logout()

            clearAccessToken();

            setUser(null);

            router.push("/login");
        } catch(error){
            console.error("Failed to logout", error);
        }
    }

    

    return(
         <button
      type="button"
      onClick={handleLogout}
      className="rounded bg-red-500 px-4 py-2 text-white"
    >
      Logout
    </button>
  );
};