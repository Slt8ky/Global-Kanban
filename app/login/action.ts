"use server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function login() {
	const { data, error } = await createClient(
		await cookies(),
	).auth.signInWithOAuth({
		provider: "google",
		options: {
			redirectTo: `https://${process.env.DOMAIN}/auth/callback`,
			queryParams: {
				access_type: "offline",
				prompt: "consent",
			},
		},
	});
	if (error) throw error;
	return data.url;
}
