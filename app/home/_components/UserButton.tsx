"use client";

import { type ComponentPropsWithoutRef, ReactNode, useTransition } from "react";
import { mutate } from "swr";
import type { Workspace } from "@/app/api/workspace/[user_id]/route";
import { toast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthProvider";
import type { Tables } from "@/database.types";
import { cn } from "@/lib/utils";
import { kickUser } from "../action";

export const UserKickButton = ({
	user_ids,
	workspace,
	children,
	callback,
	...props
}: {
	user_ids: Tables<"user">["user_id"][];
	workspace: Workspace;
	callback: () => void;
} & ComponentPropsWithoutRef<"button">) => {
	const user = useAuth();
	const [isLoading, startTransition] = useTransition();

	const handleClick = () => {
		startTransition(async () => {
			try {
				const { success, message } = await kickUser({ user_ids, workspace });
				if (!success) throw new Error(message);
				toast.success(message);
				await mutate(`/api/workspace/${user.user_id}`);
				callback();
			} catch (error) {
				toast.error(error.message);
			}
		});
	};

	return (
		<Button
			variant={"destructive"}
			disabled={isLoading}
			className={cn(isLoading && "shimmer shimmer-bg")}
			onClick={handleClick}
			{...props}
		>
			{children}
		</Button>
	);
};