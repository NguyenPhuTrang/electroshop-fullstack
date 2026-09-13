import axios from "axios";
import { cookies } from "next/headers";

export async function createServerApi() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const refreshRes = await axios.post(
    "http://localhost:5000/api/auth/refresh-token",
    {},
    { headers: { Cookie: cookieHeader } }
  );

  const accessToken = refreshRes.data.data.accessToken; 

  return axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Cookie: cookieHeader,
    },
  });
}