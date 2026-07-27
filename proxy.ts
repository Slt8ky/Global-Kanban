import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "./utils/supabase/server";

export async function proxy(request: NextRequest) {
	const pathname = request.nextUrl.pathname;
	const {
		data: { user },
	} = await createClient(await cookies()).auth.getUser();
	if (!user && !pathname.startsWith("/login")) {
		return NextResponse.redirect(new URL("/login", request.url));
	}
	if (user && !pathname.startsWith("/home")) {
		return NextResponse.redirect(new URL("/home", request.url));
	}
}

export const config = {
	matcher: "/((?!api|auth|_next/static|_next/image|favicon.ico).*)",
};
