"use client";

import { Check, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { mutate } from "swr";
import { toast } from "@/components/toast";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthProvider";
import { useWorkspace } from "@/context/WorkspaceProvider";
import { cn } from "@/lib/utils";
import { createWorkspace, leaveWorkspace } from "../action";

export const WorkspaceCreateButton = () => {
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

export const WorkspaceInviteButton = () => {
	const { selectedWorkspace } = useWorkspace();
	const [copy, setCopy] = useState(false);
	useEffect(() => {
		if (!copy) return;
		setTimeout(() => setCopy(false), 1000);
	}, [copy]);
	if (!selectedWorkspace) return;
	const handleCopy = () => {
		navigator.clipboard.writeText(
			`https://slt8ky.mooo.com/home?invite_id=${selectedWorkspace.workspace.invite_id}`,
		);
		toast.success("Copied invite link");
		setCopy(true);
	};

	return (
		<Dialog>
			<form>
				<DialogTrigger
					render={
						<Button className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-800/20 dark:text-emerald-400 dark:hover:bg-emerald-800/30 ring ring-emerald-600/50 dark:ring-emerald-500/50">
							Invite member
						</Button>
					}
				/>
				<DialogContent className="sm:max-w-sm">
					<DialogHeader>
						<DialogTitle>Invite member</DialogTitle>
					</DialogHeader>
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor="input-demo-api-key">Invite link</FieldLabel>
							<InputGroup>
								<InputGroupInput
									id="input-demo-api-key"
									type="password"
									defaultValue={`slt8ky.mooo.com?invite_id=${selectedWorkspace.workspace.invite_id}`}
									autoComplete="off"
									readOnly
								/>
								<InputGroupAddon align="inline-end">
									<Button size={"icon-xs"} onClick={handleCopy} disabled={copy}>
										{!copy ? <Copy /> : <Check />}
									</Button>
								</InputGroupAddon>
							</InputGroup>
							<FieldDescription>
								User can use that link for joining your workspace.
							</FieldDescription>
						</Field>
					</FieldGroup>
					<DialogFooter>
						<DialogClose render={<Button variant="outline">Close</Button>} />
					</DialogFooter>
				</DialogContent>
			</form>
		</Dialog>
	);
};

export const WorkspaceLeaveButton = () => {
	const user = useAuth();
	const router = useRouter();
	const { selectedWorkspace, setSelectedWorkspaceId } = useWorkspace();
	const [open, setOpen] = useState(false);
	if (!selectedWorkspace) return;
	const handleClick = async () => {
		setOpen(false);
		try {
			const res = await leaveWorkspace({
				user_id: user.user_id,
				workspace_id: selectedWorkspace.workspace.workspace_id,
			});

			if (!res.success) {
				toast.error(res.message);
				return;
			}
			toast.success(res.message);
			router.replace("/home");
			setSelectedWorkspaceId(null);
			mutate(`/api/workspace/${user.user_id}`);
		} catch {
			toast.error("An unexpected error occurred.");
		}
	};

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger
				render={
					<Button className="bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-800/20 dark:text-amber-400 dark:hover:bg-amber-800/30 ring ring-amber-600/50 dark:ring-amber-500/50">
						Leave workspace
					</Button>
				}
			/>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you absolutely sure to leave?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={handleClick}>
						Leave Workspace
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
