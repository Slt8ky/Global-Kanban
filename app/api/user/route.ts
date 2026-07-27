import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { supabase } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export async function PUT(_: NextRequest) {
	const {
		data: { user },
	} = await createClient(await cookies()).auth.getUser();
	if (!user) return;
	const {
		id: user_id,
		user_metadata: { name, email, picture },
	} = user;
	const { data, error } = await supabase
		.from("user")
		.upsert({
			user_id,
			name,
			email,
			picture,
		})
		.select();
	if (error) throw error;
	const [row] = data;
	return Response.json(row);
}
