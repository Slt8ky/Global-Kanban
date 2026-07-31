"use client";

import { CircleCheckBig, CircleDashed, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { mutate } from "swr";
import type { Workspace } from "@/app/api/workspace/[user_id]/route";
import { toast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import {
	Combobox,
	ComboboxChip,
	ComboboxChips,
	ComboboxChipsInput,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxItem,
	ComboboxList,
	ComboboxValue,
	useComboboxAnchor,
} from "@/components/ui/combobox";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthProvider";
import { useWorkspace } from "@/context/WorkspaceProvider";
import { FormResponse } from "@/lib/types";
import { cn } from "@/lib/utils";
import { createTask, deleteTask, editTask } from "../action";

export const TaskCreateButton = () => {
	const user = useAuth();
	const { selectedWorkspace } = useWorkspace();
	const anchor = useComboboxAnchor();
	const [isPending, startTransition] = useTransition();
	const [open, setOpen] = useState(false);
	const [error, setError] = useState("");
	if (!selectedWorkspace) return;
	const handleSubmit = (formData: FormData) => {
		startTransition(async () => {
			try {
				const name = formData.get("name")?.toString().trim();
				const description = formData.get("description")?.toString().trim();
				const assigned_users = formData.getAll("assigned_users") as string[];
				if (!name) throw new Error("Please provide task name!");
				const { success, message } = await createTask({
					task: {
						name,
						description,
						task_status_id: "to_do",
						workspace_id: selectedWorkspace.workspace.workspace_id,
						user_id: user.user_id,
					},
					task_assign: assigned_users.map((user) => ({
						user_id: user,
					})),
				});
				if (!success) throw new Error(message);
				toast.success(message);
				setError("");
				setOpen(false);
				mutate(`/api/workspace/${user.user_id}`);
			} catch (error) {
				setError(error.message);
			}
		});
	};
	if (!selectedWorkspace) return null;
	type WorkspaceMember =
		(typeof selectedWorkspace.workspace.workspace_member)[number];

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				render={
					<Button className="min-h-0" size="icon-sm">
						<Plus />
					</Button>
				}
			/>
			<DialogContent className="sm:max-w-sm">
				<form action={handleSubmit} className="flex gap-3 flex-col">
					<DialogHeader>
						<DialogTitle>Add Task</DialogTitle>
					</DialogHeader>
					<FieldError>{error}</FieldError>
					<FieldGroup>
						<Field>
							<Label htmlFor="name">Task Name</Label>
							<Input id="name" name="name" />
						</Field>
						<Field>
							<Label htmlFor="description">Task Description</Label>
							<Textarea
								className="max-h-80"
								id="description"
								name="description"
							/>
						</Field>
						<Field>
							<Label htmlFor="assigned_users">Task Assign</Label>
							<Combobox
								id="assigned_users"
								name="assigned_users"
								multiple
								autoHighlight
								items={selectedWorkspace.workspace.workspace_member}
								itemToStringValue={(item: WorkspaceMember) => item.user_id}
							>
								<ComboboxChips ref={anchor}>
									<ComboboxValue>
										{(values: WorkspaceMember[]) => (
											<>
												{values.map((value) => (
													<ComboboxChip key={value.user_id}>
														{value.user.name}
													</ComboboxChip>
												))}
												<ComboboxChipsInput />
											</>
										)}
									</ComboboxValue>
								</ComboboxChips>
								<ComboboxContent anchor={anchor}>
									<ComboboxEmpty>No member found.</ComboboxEmpty>
									<ComboboxList>
										{(item: WorkspaceMember) => (
											<ComboboxItem key={item.user_id} value={item}>
												{item.user.name}
											</ComboboxItem>
										)}
									</ComboboxList>
								</ComboboxContent>
							</Combobox>
						</Field>
					</FieldGroup>
					<DialogFooter>
						<DialogClose render={<Button variant="outline">Cancel</Button>} />
						<Button
							type="submit"
							disabled={isPending}
							className={cn(isPending && "shimmer shimmer-bg")}
						>
							Save changes
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export const TaskChangeStatusButton = ({
	status,
	task,
	onChangeStatus,
}: {
	status: "to_do" | "in_progress" | "done";
	task: Workspace["workspace"]["task"][number];
	onChangeStatus: (
		task: Workspace["workspace"]["task"][number],
		status: string,
	) => void;
}) => {
	const varient = {
		to_do: {
			className: "bg-red-600/20 hover:bg-red-600/10 text-red-500",
			icon: <X />,
		},
		in_progress: {
			className: "bg-amber-600/20 hover:bg-amber-600/10 text-amber-500",
			icon: <CircleDashed />,
		},
		done: {
			className: "bg-emerald-600/20 hover:bg-emerald-600/10 text-emerald-500",
			icon: <CircleCheckBig />,
		},
	};

	return (
		<Button
			size={"icon-sm"}
			className={varient[status].className}
			onClick={() => onChangeStatus(task, status)}
		>
			{varient[status].icon}
		</Button>
	);
};

export const TaskDeleteButton = ({
	task,
}: {
	task: Workspace["workspace"]["task"][number];
}) => {
	const user = useAuth();
	const [isLoading, startTransition] = useTransition();

	const handleClick = () => {
		startTransition(async () => {
			try {
				const { success, message } = await deleteTask(task);
				if (!success) throw new Error(message);
				toast.success(message);
				mutate(`/api/workspace/${user.user_id}`);
			} catch (error) {
				toast.error(error.message);
			}
		});
	};

	return (
		<Button
			size={"sm"}
			variant={"destructive"}
			onClick={handleClick}
			disabled={isLoading}
			className={cn(isLoading && "shimmer shimmer-bg")}
		>
			Delete task
		</Button>
	);
};

export const TaskEditButton = ({
	task,
}: {
	task: Workspace["workspace"]["task"][number];
}) => {
	const user = useAuth();
	const { selectedWorkspace } = useWorkspace();
	const anchor = useComboboxAnchor();
	const [isPending, startTransition] = useTransition();
	const [open, setOpen] = useState(false);
	const [error, setError] = useState("");
	const [assign_users, setAssign_users] = useState<WorkspaceMember[]>([]);
	useEffect(() => {
		if (!selectedWorkspace) return;
		startTransition(() => {
			setAssign_users(
				selectedWorkspace.workspace.workspace_member.filter((item) =>
					task.task_assign.map((item) => item.user_id).includes(item.user_id),
				),
			);
		});
	}, [selectedWorkspace, task.task_assign]);
	if (!selectedWorkspace) return;
	const handleSubmit = (formData: FormData) => {
		startTransition(async () => {
			try {
				setOpen(false);
				const name = formData.get("name")?.toString().trim();
				const description = formData.get("description")?.toString().trim();
				const assigned_users = formData.getAll("assigned_users") as string[];
				if (!name) throw new Error("Please provide task name!");
				const { success, message } = await editTask({
					task: {
						task_id: task.task_id,
						name,
						description,
					},
					task_assign: assigned_users.map((user) => ({
						task_id: task.task_id,
						user_id: user,
					})),
				});
				if (!success) throw new Error(message);
				toast.success(message);
				setError("");
				mutate(`/api/workspace/${user.user_id}`);
			} catch (error) {
				setError(error.message);
			}
		});
	};
	if (!selectedWorkspace) return null;
	type WorkspaceMember =
		(typeof selectedWorkspace.workspace.workspace_member)[number];

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				render={
					<Button size={"sm"} variant={"outline"}>
						Edit Task
					</Button>
				}
			/>
			<DialogContent className="sm:max-w-sm">
				<form action={handleSubmit} className="flex gap-3 flex-col">
					<DialogHeader>
						<DialogTitle>Add Task</DialogTitle>
					</DialogHeader>
					<FieldError>{error}</FieldError>
					<FieldGroup>
						<Field>
							<Label htmlFor="name">Task Name</Label>
							<Input id="name" name="name" defaultValue={task.name} />
						</Field>
						<Field>
							<Label htmlFor="description">Task Description</Label>
							<Textarea
								className="max-h-80"
								id="description"
								name="description"
								defaultValue={task.description ?? undefined}
							/>
						</Field>
						<Field>
							<Label htmlFor="assigned_users">Task Assign</Label>
							<Combobox
								id="assigned_users"
								name="assigned_users"
								multiple
								autoHighlight
								items={selectedWorkspace.workspace.workspace_member}
								itemToStringValue={(item: WorkspaceMember) => item.user_id}
								value={assign_users}
								onValueChange={(users) => setAssign_users(users)}
							>
								<ComboboxChips ref={anchor}>
									<ComboboxValue>
										{(values: WorkspaceMember[]) => (
											<>
												{values.map((value) => (
													<ComboboxChip key={value.user_id}>
														{value.user.name}
													</ComboboxChip>
												))}
												<ComboboxChipsInput />
											</>
										)}
									</ComboboxValue>
								</ComboboxChips>
								<ComboboxContent anchor={anchor}>
									<ComboboxEmpty>No member found.</ComboboxEmpty>
									<ComboboxList>
										{(item: WorkspaceMember) => (
											<ComboboxItem key={item.user_id} value={item}>
												{item.user.name}
											</ComboboxItem>
										)}
									</ComboboxList>
								</ComboboxContent>
							</Combobox>
						</Field>
					</FieldGroup>
					<DialogFooter>
						<DialogClose render={<Button variant="outline">Cancel</Button>} />
						<Button
							type="submit"
							disabled={isPending}
							className={cn(isPending && "shimmer shimmer-bg")}
						>
							Apply changes
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
