"use client";

import { format } from "date-fns";
import { Ellipsis, User } from "lucide-react";
import { useMemo, useTransition } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
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
		<>
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
					<CardContent className="space-y-5 p-5 flex-1 flex-col overflow-y-scroll">
						{item.value.map((task) => (
							<Card
								key={task.task_id}
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
												{task.task_status_id !== "in_progress" && (
													<TaskChangeStatusButton
														status="in_progress"
														task={task}
														onChangeStatus={handleClick}
													/>
												)}
												{task.task_status_id !== "done" && (
													<TaskChangeStatusButton
														status="done"
														task={task}
														onChangeStatus={handleClick}
													/>
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
										{format(new Date(task.created_at), "MM/dd/yyyy HH:mm:yy")}
									</span>
								</CardFooter>
							</Card>
						))}
					</CardContent>
				</Card>
			))}
		</>
	);
};
