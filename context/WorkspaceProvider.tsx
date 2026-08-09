"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import {
	createContext,
	type Dispatch,
	type ReactNode,
	type SetStateAction,
	startTransition,
	useContext,
	useEffect,
	useMemo,
	useState,
	useTransition,
} from "react";
import useSWR, { mutate } from "swr";
import type { Workspace } from "@/app/api/workspace/[user_id]/route";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "./AuthProvider";

const WorkspaceContext = createContext<{
	workspaces: Workspace[];
	selectedWorkspace: Workspace | null;
	setSelectedWorkspaceId: Dispatch<SetStateAction<string | null>>;
	focus: boolean;
	setFocus: Dispatch<SetStateAction<boolean>>;
	isLoading: boolean;
	channels: Record<string, RealtimeChannel>;
} | null>(null);

export const useWorkspace = () => {
	const context = useContext(WorkspaceContext);
	if (!context) throw new Error("Workspace Load Failure");
	return context;
};

export const WorkspaceProvider = ({ children }: { children?: ReactNode }) => {
	const user = useAuth();
	const [focus, setFocus] = useState(false);
	const [channels, setChannels] = useState<Record<string, RealtimeChannel>>({});
	const { data: workspaces = [], isLoading } = useSWR<Workspace[]>(
		`/api/workspace/${user.user_id}`,
		(url: string) => fetch(url).then((res) => res.json()),
	);
	const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(
		null,
	);
	const selectedWorkspace = useMemo(() => {
		return (
			workspaces.find(
				(w) => w.workspace.workspace_id === selectedWorkspaceId,
			) ?? null
		);
	}, [selectedWorkspaceId, workspaces]);
	useEffect(() => {
		const client = createClient();
		startTransition(() => {
			setChannels(
				Object.fromEntries(
					workspaces.map((workspace) => {
						const channel = client.channel(workspace.workspace_id);
						channel
							.on("broadcast", { event: "workspace" }, () => {
								mutate(`/api/workspace/${user.user_id}`);
							})
							.subscribe();
						return [workspace.workspace_id, channel];
					}),
				),
			);
		});
	}, [user.user_id, workspaces]);
	const value = useMemo(
		() => ({
			workspaces,
			selectedWorkspace,
			setSelectedWorkspaceId,
			focus,
			setFocus,
			isLoading,
			channels,
		}),
		[channels, focus, isLoading, selectedWorkspace, workspaces],
	);

	return (
		<WorkspaceContext.Provider value={value}>
			{children}
		</WorkspaceContext.Provider>
	);
};
