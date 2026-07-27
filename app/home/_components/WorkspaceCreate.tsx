"use client";

import { redirect, useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { mutate } from "swr";
import { toast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthProvider";
import { cn } from "@/lib/utils";
import { createWorkspace } from "../action";

export const WorkspaceCreate = () => {
	const user = useAuth();
	const [open, setOpen] = useState(false);
	const router = useRouter();
	const [error, dispatch, isPending] = useActionState(
		async (_: string | undefined, formData: FormData) => {
			try {
				const name = formData.get("name")?.toString().trim();
				if (!name) throw new Error("Please provide a workspace name!");
				const {
					message,
					success,
					data: workspace_id,
				} = await createWorkspace({
					name,
					user_id: user.user_id,
				});
				if (!success) throw new Error(message);
				mutate(`/api/workspace/${user.user_id}`);
				router.push(`/home?workspace_id=${workspace_id}`);
				toast.success(message);
				setOpen(false);
			} catch (error) {
				return error.message as string;
			}
		},
		undefined,
	);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger render={<Button>Create Workspace</Button>} />
			<DialogContent className="sm:max-w-sm">
				<form action={dispatch} className="flex gap-5 flex-col">
					<DialogHeader>
						<DialogTitle>Create workspace</DialogTitle>
						<DialogDescription>
							Create workspace to manage task.
						</DialogDescription>
					</DialogHeader>
					<FieldGroup>
						<FieldError>{error}</FieldError>
						<Field>
							<Label htmlFor="name">Workspace Name</Label>
							<Input id="name" name="name" />
						</Field>
					</FieldGroup>
					<DialogFooter>
						<DialogClose render={<Button variant="outline">Cancel</Button>} />
						<Button
							type="submit"
							disabled={isPending}
							className={cn(isPending && "shimmer shimmer-bg")}
						>
							Create Workspace
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
