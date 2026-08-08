"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { Check, Ellipsis, X, Zap } from "lucide-react";
import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthProvider";
import { useWorkspace } from "@/context/WorkspaceProvider";
import {
	WorkspaceDeleteButton,
	WorkspaceFocusButton,
	WorkspaceInviteButton,
	WorkspaceLeaveButton,
	WorkspaceManageMemberButton,
} from "./WorkspaceButton";

gsap.registerPlugin(useGSAP);

export const WorkspacePanel = () => {
	const user = useAuth();
	const { selectedWorkspace } = useWorkspace();
	const items = useMemo(
		() =>
			selectedWorkspace
				? [
						{
							icon: (
								<X
									stroke="var(--color-emerald-400)"
									className="drop-shadow-sm drop-shadow-emerald-500/50"
								/>
							),
							name: "Todo",
							value: selectedWorkspace.workspace.task.filter(
								(item) => item.task_status_id === "to_do",
							).length,
						},
						{
							icon: (
								<Ellipsis
									stroke="var(--color-emerald-400)"
									className="drop-shadow-sm drop-shadow-emerald-500/50"
								/>
							),
							name: "In Progress",
							value: selectedWorkspace.workspace.task.filter(
								(item) => item.task_status_id === "in_progress",
							).length,
						},
						{
							icon: (
								<Check
									stroke="var(--color-emerald-400)"
									className="drop-shadow-sm drop-shadow-emerald-500/50"
								/>
							),
							name: "Done",
							value: selectedWorkspace.workspace.task.filter(
								(item) => item.task_status_id === "done",
							).length,
						},
					]
				: [],
		[selectedWorkspace],
	);

	return (
		selectedWorkspace && (
			<Card className="col-span-3 gap-0">
				<CardContent className="flex h-full gap-3">
					<Card>
						<CardContent
							className="grid w-fit h-full gap-x-3"
							style={{ gridTemplateColumns: "auto 1fr" }}
						>
							<div className="my-auto row-span-2">
								<Zap
									stroke="var(--color-emerald-400)"
									className="drop-shadow-sm drop-shadow-emerald-500/50"
								/>
							</div>
							<div className="flex gap-3">
								<div className="flex flex-col">
									<span className="text-emerald-600 font-bold">
										Workspace Name
									</span>
									<span className="text-muted-foreground font-mono">
										{selectedWorkspace.workspace.name}
									</span>
								</div>
								<Separator orientation="vertical" />
								<div className="flex flex-col ">
									<span className="text-emerald-600 font-bold">
										Workspace ID
									</span>
									<span className="text-muted-foreground font-mono">
										{selectedWorkspace.workspace.workspace_id}
									</span>
								</div>
								<Separator orientation="vertical" />
								<div className="flex flex-col ">
									<span className="text-emerald-600 font-bold">
										Workspace Member
									</span>
									<span className="text-muted-foreground font-mono">
										{selectedWorkspace.workspace.workspace_member.length}
									</span>
								</div>
								<Separator orientation="vertical" />
								<div className="flex h-full gap-3 items-center">
									<WorkspaceInviteButton />
									<WorkspaceManageMemberButton />
									{selectedWorkspace.workspace.user_id === user.user_id ? (
										<WorkspaceDeleteButton />
									) : (
										<WorkspaceLeaveButton />
									)}
									<WorkspaceFocusButton />
								</div>
							</div>
						</CardContent>
					</Card>
					{items.map((item) => (
						<Card key={item.name}>
							<CardContent
								className="grid w-fit h-full gap-x-3 grid-rows-2"
								style={{ gridTemplateColumns: "auto 1fr" }}
							>
								<div className="my-auto row-span-2">{item.icon}</div>
								<span className="text-emerald-600 font-bold">{item.name}</span>
								<span className="text-muted-foreground font-mono">
									{item.value}
								</span>
							</CardContent>
						</Card>
					))}
				</CardContent>
			</Card>
		)
	);
};
