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
	children,
	className,
}: {
	id: string;
	children: ReactNode;
	className?: string;
}) => {
	const { ref } = useDraggable({ id });
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
	const { selectedWorkspace } = useWorkspace();
	const [isLoading, startTransition] = useTransition();
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
				mutate(`/api/workspace/${user.user_id}`);
			} catch (error) {
				toast.error(error.message);
			}
		});
	};

	const items = useMemo(
		() =>
			selectedWorkspace
				? [
						{
							key: "to_do",
							name: "TO DO",
							value:
								Object.groupBy(
									selectedWorkspace.workspace.task,
									(item) => item.task_status_id,
								)?.to_do ?? [],
						},
						{
							key: "in_progress",
							name: "IN PROGRESS",
							value:
								Object.groupBy(
									selectedWorkspace.workspace.task,
									(item) => item.task_status_id,
								)?.in_progress ?? [],
						},
						{
							key: "done",
							name: "DONE",
							value:
								Object.groupBy(
									selectedWorkspace.workspace.task,
									(item) => item.task_status_id,
								)?.done ?? [],
						},
					]
				: [],
		[selectedWorkspace],
	);

	return (
		<DragDropProvider
			onDragEnd={async (event) => {
				const operation = event.operation;
				if (!operation.source?.id || !operation.target?.id) return;
				const task_id = operation.source.id as string;
				const task_status_id = operation.target.id as string;
				await changeTaskStatus({
					task: {
						task_id,
					},
					status: task_status_id,
				});

				await mutate(`/api/workspace/${user.user_id}`);
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
					<DroppableItem id={item.key} className="h-full">
						<CardContent className="h-full space-y-5 p-5 flex-1 flex-col overflow-y-scroll">
							{item.value.map((task) => (
								<DragableItem id={task.task_id} key={task.task_id}>
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
																	<Tooltip key={status}>
																		<TooltipTrigger
																			render={
																				<TaskChangeStatusButton
																					status={status}
																					task={task}
																					onChangeStatus={handleClick}
																				/>
																			}
																		/>
																		<TooltipContent>
																			<p>Add to library</p>
																		</TooltipContent>
																	</Tooltip>
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
