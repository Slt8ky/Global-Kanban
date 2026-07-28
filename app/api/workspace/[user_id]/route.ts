import type { QueryData } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { supabase } from "@/utils/supabase/admin";

export const getWorkspaceByUserId = (userId: string) =>
	supabase
		.from("workspace_member")
		.select(`
			join_at,
			workspace_id,
			workspace(
				*,
				user!workspace_user_id_fkey(*),
				workspace_member!workspace_member_workspace_id_fkey(
					*, 
					user!workspace_member_user_id_fkey(*)
				),
				task(
					*,
					task_assign!task_assign_task_id_fkey(
						*,
						user!task_assign_user_id_fkey(*)
					)
				)
			)
		`)
		.eq("user_id", userId);

export type Workspace = QueryData<
	ReturnType<typeof getWorkspaceByUserId>
>[number];

export async function GET(
	_: NextRequest,
	ctx: RouteContext<"/api/workspace/[user_id]">,
) {
	try {
		const { user_id } = await ctx.params;
		const { data, error } = await getWorkspaceByUserId(user_id);
		if (error) throw error;
		return Response.json(data);
	} catch (error) {
		console.log(error);
	}
}
