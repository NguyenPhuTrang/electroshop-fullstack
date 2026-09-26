import axios from "axios";
import { mbBankConfig } from "../config/bankService";

type CreateMbQrPaymentData = {
    orderNumber: string;
    amount: number;
};

export const createMbQrPayment = async (
    data: CreateMbQrPaymentData
) => {
    const response = await axios.post(
        `${mbBankConfig.apiUrl}/YOUR_ENDPOINT`,
        data,
        {
            headers: {
                // MB authentication
            },
        }
    );

    return response.data;
};