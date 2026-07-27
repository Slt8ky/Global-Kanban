"use client";

import { Crown } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Workspace } from "@/app/api/workspace/[id]/route";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "@/components/ui/combobox";
import { useAuth } from "@/context/AuthProvider";
import { useWorkspace } from "@/context/WorkspaceProvider";
import { cn } from "@/lib/utils";

export const WorkspaceSelect = () => {
	const router = useRouter();
	const user = useAuth();
	const { workspaces, selectedWorkspace, setSelectedWorkspace, isLoading } =
		useWorkspace();

	if (!workspaces) return null;

	return (
		<Combobox
			items={workspaces}
			itemToStringLabel={(item: Workspace) => item.workspace.name}
			value={selectedWorkspace}
			onValueChange={(item) => {
				if (item) {
					setSelectedWorkspace(item);
					router.push(`/home?workspace_id=${item.workspace.workspace_id}`);
				}
			}}
		>
			<ComboboxInput
				placeholder="Select a workspace"
				disabled={isLoading}
				className={cn(isLoading && "shimmer shimmer-bg")}
			/>
			<ComboboxContent>
				<ComboboxEmpty>No workspaces found.</ComboboxEmpty>
				<ComboboxList>
					{(item: Workspace) => (
						<ComboboxItem key={item.workspace.workspace_id} value={item}>
							<div className="flex gap-2 items-center">
								<div>{item.workspace.name}</div>
								{item.workspace.user_id === user.user_id && (
									<div className="font-mono px-1.5 bg-amber-800/20! text-amber-600! rounded-sm text-xs ">
										owner
									</div>
								)}
							</div>
							<div className="font-mono px-1.5 bg-accent-foreground! text-background! rounded-sm ml-auto text-xs ">
								todo:
								{" " +
									item.workspace.task.filter(
										(item) => item.task_status_id === "to_do",
									).length}
							</div>
						</ComboboxItem>
					)}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	);
};
