"use client";

import { DragDropProvider, useDraggable, useDroppable } from "@dnd-kit/react";
import { format } from "date-fns";
import { Ellipsis, User } from "lucide-react";
import { type ReactNode, useMemo, useState, useTransition } from "react";
import { mutate } from "swr";
import type { Workspace } from "@/app/api/workspace/[user_id]/route";
import { toast } from "@/components/toast";
import {
	Avatar,
	AvatarFallback,
	AvatarGroup,
	AvatarGroupCount,
	AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthProvider";
import { useWorkspace } from "@/context/WorkspaceProvider";
import { cn } from "@/lib/utils";
import { changeTaskStatus } from "../action";
import {
	TaskChangeStatusButton,
	TaskCreateButton,
	TaskDeleteButton,
	TaskEditButton,
} from "./TaskButton";

const DragableItem = ({
	id,
	task,
	children,
	className,
}: {
	id: string;
	task: Workspace["workspace"]["task"][number];
	children: ReactNode;
	className?: string;
}) => {
	const { ref } = useDraggable({ id, data: task });
	return (
		<div ref={ref} className={className}>
			{children}
		</div>
	);
};

const DroppableItem = ({
	id,
	children,
	className,
}: {
	id: string;
	children: ReactNode;
	className?: string;
}) => {
	const { ref } = useDroppable({ id });
	return (
		<div ref={ref} className={className}>
			{children}
		</div>
	);
};

export const WorkspaceTasks = () => {
	const user = useAuth();
	const { selectedWorkspace, focus } = useWorkspace();
	const [isLoading, startTransition] = useTransition();
	const [dragging, setDragging] = useState(false);

	const handleClick = (
		task: Workspace["workspace"]["task"][number],
		status: string,
	) => {
		startTransition(async () => {
			try {
				const { success, message } = await changeTaskStatus({
					task,
					status,
				});
				if (!success) throw new Error(message);
				toast.success(message);
				await mutate(`/api/workspace/${user.user_id}`);
			} catch (error) {
				toast.error(error.message);
			}
		});
	};

	const items = useMemo(() => {
		if (!selectedWorkspace) return [];
		const items = Object.groupBy(
			selectedWorkspace.workspace.task.filter((task) => {
				if (
					focus &&
					!task.task_assign.filter(
						(task_assign) => task_assign.user_id === user.user_id,
					).length
				)
					return false;
				return true;
			}),
			(item) => item.task_status_id,
		);

		return selectedWorkspace
			? [
					{
						key: "to_do",
						name: "TO DO",
						value: items?.to_do ?? [],
					},
					{
						key: "in_progress",
						name: "IN PROGRESS",
						value: items?.in_progress ?? [],
					},
					{
						key: "done",
						name: "DONE",
						value: items?.done ?? [],
					},
				]
			: [];
	}, [focus, selectedWorkspace, user.user_id]);

	return (
		<DragDropProvider
			onDragStart={() => setDragging(true)}
			onDragEnd={async (event) => {
				setDragging(false);
				const operation = event.operation;
				if (
					!operation.source?.id ||
					!operation.source?.data ||
					!operation.target?.id
				)
					return;
				const task = operation.source
					.data as unknown as Workspace["workspace"]["task"][number];
				const task_id = operation.source.id as string;
				const task_status_id = operation.target.id as string;
				if (task.task_status_id === task_status_id) return;
				await mutate<Workspace[]>(
					`/api/workspace/${user.user_id}`,
					async (current) => {
						if (!current) return [];
						await changeTaskStatus({
							task: {
								task_id,
							},
							status: task_status_id,
						});
						return current.map((a) => ({
							...a,
							workspace: {
								...a.workspace,
								task: a.workspace.task.map((b) => {
									return b.task_id === task_id
										? { ...b, task_status_id: task_status_id }
										: b;
								}),
							},
						}));
					},
					{
						optimisticData: (current) => {
							if (!current) return [];
							toast.success(
								`Changed status task ${task.name} from ${task.task_status_id} to ${task_status_id}`,
							);
							return current.map((a) => ({
								...a,
								workspace: {
									...a.workspace,
									task: a.workspace.task.map((b) => {
										return b.task_id === task_id
											? { ...b, task_status_id: task_status_id }
											: b;
									}),
								},
							}));
						},
						revalidate: false,
					},
				);
			}}
		>
			{items.map((item) => (
				<Card key={item.key} className="p-0 gap-0 divide-y">
					<CardHeader className="p-0">
						<CardTitle className="grid p-5 grid-cols-[1fr_auto_1fr] grid-rows-[1.8rem] items-center ">
							<div />
							<div className="h-full flex gap-2 items-center text-center">
								<span>{item.name}</span>
								<Badge className="font-mono">{item.value.length}</Badge>
							</div>
							{item.key === "to_do" && (
								<div className="flex justify-end">
									<TaskCreateButton />
								</div>
							)}
						</CardTitle>
					</CardHeader>
					<DroppableItem id={item.key} className="min-h-0 h-full flex flex-col">
						<CardContent
							className={cn(
								"min-h-0 space-y-5 py-1 pl-1 pr-2 m-2 h-full flex-col overflow-y-scroll duration-300 rounded-2xl",
								dragging && "bg-black/20",
							)}
						>
							{item.value.map((task) => (
								<DragableItem id={task.task_id} task={task} key={task.task_id}>
									<Card
										className={cn(
											"*:duration-300",
											isLoading && "shimmer shimmer-bg *:opacity-0",
										)}
									>
										<CardHeader className="grid grid-rows-2 grid-cols-[1fr_auto]">
											<CardTitle>{task.name}</CardTitle>
											<div className="flex gap-3 items-center">
												<Card className="p-0">
													<CardContent className="flex gap-2 p-2">
														{(["to_do", "in_progress", "done"] as const).map(
															(status) =>
																task.task_status_id !== status && (
																	<TaskChangeStatusButton
																		key={status}
																		status={status}
																		task={task}
																		onChangeStatus={handleClick}
																	/>
																),
														)}
													</CardContent>
												</Card>
												<Separator orientation="vertical" />
												<Popover>
													<PopoverTrigger
														render={
															<Button size={"icon-sm"} variant={"secondary"}>
																<Ellipsis />
															</Button>
														}
													/>
													<PopoverContent className={"w-fit p-2"} align="end">
														<TaskEditButton task={task} />
														<Separator />
														<TaskDeleteButton task={task} />
													</PopoverContent>
												</Popover>
											</div>
											<CardDescription className="break-all whitespace-pre-line col-span-2">
												{task.description}
											</CardDescription>
										</CardHeader>
										<CardFooter className="h-16 justify-between text-muted-foreground">
											<AvatarGroup>
												{task.task_assign.slice(0, 4).map((item) => (
													<Avatar key={item.user_id}>
														<AvatarImage src={item.user.picture} />
														<AvatarFallback>
															<User />
														</AvatarFallback>
													</Avatar>
												))}
												{task.task_assign.length > 4 && (
													<AvatarGroupCount>
														+{task.task_assign.length - 4}
													</AvatarGroupCount>
												)}
											</AvatarGroup>
											<span>
												{format(
													new Date(task.created_at),
													"MM/dd/yyyy HH:mm:yy",
												)}
											</span>
										</CardFooter>
									</Card>
								</DragableItem>
							))}
						</CardContent>
					</DroppableItem>
				</Card>
			))}
		</DragDropProvider>
	);
};
