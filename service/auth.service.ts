import { getData, postData } from "@/helper/apiHelper";
import { ILogin } from "@/types/ILogin";

export const loginService = async (payload : ILogin) => {
    const response = await postData(`login`, payload);

    return response;
}

export const loginGoogleService = async () => {
    const response = await getData(`auth/google/login`);
    return response;
}

export const googleCallbackService = async (code: string, role: string | null) => {
    const response = await postData<any>(`auth/google/callback`, { code, role });
    return response;
}

export const registerFromGoogleService = async (payload: any) => {
    const response = await postData("register-google-customer", payload);
    return response;
}
 