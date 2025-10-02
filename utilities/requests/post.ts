import axios from "axios";
import { toast } from "sonner";

import { logger } from "@/utils/logger";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string || "http://localhost:3000";

axios.defaults.baseURL = BASE_URL;

interface IPostOptions {
    headers?: Record<string, string>;
    params?: Record<string, any>;
}

const POST = async (
    route: string,
    data: any,
    options: IPostOptions = {},
    messages: IMessages = {}
) => {

    try {

        const response = toast.promise(

            axios.post(route, data, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                params: options.params,
            }),

            {
                loading: messages.loading || "Loading ...",
                success: (response) => response?.data?.message || messages.success || "Success!",
                error: (error) => error?.response?.data?.message || messages.error || "Sorry, something went wrong while processing your request.",
            }

        );

        return response;

    } catch (error) {

        logger("Request Error, On POST : ", error);

        const err = axios.isAxiosError(error)
            ? error?.response?.data?.message || "Sorry, something went wrong while processing your request."
            : "Oops! We couldn't complete your request right now. Please check your connection or try again later.";

        toast.error(err);

    }

}

export { POST }