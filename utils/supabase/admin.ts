import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

export const supabase = createClient<Database>(supabaseUrl!, secretKey!, {
	auth: {
		persistSession: false,
		autoRefreshToken: false,
		detectSessionInUrl: false,
	},
});
