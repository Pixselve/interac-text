"use server"

import {cookies} from "next/headers";
import {CookiesEnum} from "@/lib/cookies";

export async function saveApiKeyToCookies(apiKey: string) {
  cookies().set(CookiesEnum.openAIApiKey, apiKey);
}

