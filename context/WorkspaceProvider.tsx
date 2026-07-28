"use client";

import {
	createContext,
	type Dispatch,
	type ReactNode,
	type SetStateAction,
	useContext,
	useMemo,
	useState,
} from "react";
import useSWR from "swr";
import type { Workspace } from "@/app/api/workspace/[user_id]/route";
import { useAuth } from "./AuthProvider";

const WorkspaceContext = createContext<{
	workspaces: Workspace[];
	selectedWorkspace: Workspace | null;
	setSelectedWorkspaceId: Dispatch<SetStateAction<string | null>>;
	isLoading: boolean;
} | null>(null);

export const useWorkspace = () => {
	const context = useContext(WorkspaceContext);
	if (!context) throw new Error("Workspace Load Failure");
	return context;
};

export const WorkspaceProvider = ({ children }: { children?: ReactNode }) => {
	const user = useAuth();
	const { data: workspaces = [], isLoading } = useSWR<Workspace[]>(
		`/api/workspace/${user.user_id}`,
		(url: string) => fetch(url).then((res) => res.json()),
	);
	const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(
		null,
	);
	const selectedWorkspace = useMemo(
		() =>
			workspaces.find(
				(w) => w.workspace.workspace_id === selectedWorkspaceId,
			) ?? null,
		[selectedWorkspaceId, workspaces],
	);
	const value = useMemo(
		() => ({
			workspaces,
			selectedWorkspace,
			setSelectedWorkspaceId,
			isLoading,
		}),
		[isLoading, selectedWorkspace, workspaces],
	);

	return (
		<WorkspaceContext.Provider value={value}>
			{children}
		</WorkspaceContext.Provider>
	);
};
