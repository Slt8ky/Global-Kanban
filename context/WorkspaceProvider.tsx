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
import type { Workspace } from "@/app/api/workspace/[id]/route";
import { useAuth } from "./AuthProvider";

const WorkspaceContext = createContext<{
	workspaces: Workspace[];
	selectedWorkspace: Workspace | null;
	setSelectedWorkspace: Dispatch<SetStateAction<Workspace | null>>;
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
	const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(
		null,
	);
	const value = useMemo(
		() => ({
			workspaces,
			selectedWorkspace,
			setSelectedWorkspace,
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
