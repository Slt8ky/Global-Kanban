import type { QueryData } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { supabase } from "@/utils/supabase/admin";

const query = supabase.from("user").select("*");
export type User = QueryData<typeof query>[number];

export async function GET(
	_: NextRequest,
	ctx: RouteContext<"/api/user/[user_id]">,
) {
	const { user_id } = await ctx.params;
	const { data, error } = await query.eq("user_id", user_id);
	if (error) throw error;
	const [row] = data;
	return Response.json(row);
}
