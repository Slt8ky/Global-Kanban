"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkspace } from "@/context/WorkspaceProvider";
import { TaskCreateButton } from "./TaskButton";

export const WorkspaceTask = () => {
	const { selectedWorkspace } = useWorkspace();

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
					<CardContent className="flex-1 overflow-y-auto">
						{item.value.map((task) => (
							<Card key={task.task_id}>
								<CardContent>{task.name}</CardContent>
							</Card>
						))}
					</CardContent>
				</Card>
			))}
		</>
	);
};
