import { type NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/admin";

export async function GET(
	_: NextRequest,
	ctx: RouteContext<"/api/workspace/join/[invite_id]">,
) {
	try {
		const { invite_id } = await ctx.params;
		const { data, error } = await supabase
			.from("workspace")
			.select()
			.eq("invite_id", invite_id);
		if (error) throw error;
		if (!data?.length) throw new Error("Invalid invite id!");
		const [row] = data;
		return NextResponse.json({
			success: true,
			message: undefined,
			data: row,
		});
	} catch (error) {
		return NextResponse.json({
			success: false,
			message: error.message,
		});
	}
}
