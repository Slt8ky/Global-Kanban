"use server";
import { cookies, headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function login() {
	const headersList = await headers();
	const host = headersList.get("host");
	const { data, error } = await createClient(
		await cookies(),
	).auth.signInWithOAuth({
		provider: "google",
		options: {
			redirectTo: `https://${host}/auth/callback`,
			queryParams: {
				access_type: "offline",
				prompt: "consent",
			},
		},
	});
	if (error) throw error;
	return data.url;
}
