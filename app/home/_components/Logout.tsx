import { redirect } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

export const Logout = () => {
	const [isLoading, startTransition] = useTransition();

	const handleClick = () => {
		startTransition(async () => {
			await createClient().auth.signOut();
			redirect("/login");
		});
	};
	return (
		<Button
			variant={"destructive"}
			disabled={isLoading}
			className={cn(isLoading && "shimmer shimmer-bg")}
			onClick={handleClick}
		>
			Logout
		</Button>
	);
};
