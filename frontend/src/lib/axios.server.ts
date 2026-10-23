import axios from "axios";
import { cookies } from "next/headers";

const backendUrl = (
  process.env.BACKEND_URL || "http://localhost:5000"
).replace(/\/$/, "");

export async function createServerApi() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const refreshRes = await axios.post(
    `${backendUrl}/api/auth/refresh-token`,
    {},
    {
      headers: {
        Cookie: cookieHeader,
      },
    }
  );

  const accessToken = refreshRes.data.data.accessToken;

  return axios.create({
    baseURL: `${backendUrl}/api`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Cookie: cookieHeader,
    },
  });
}