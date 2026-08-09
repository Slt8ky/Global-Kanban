"use client";

import { redirect, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useTransition } from "react";
import { mutate } from "swr";
import { toast } from "@/components/toast";
import { useAuth } from "@/context/AuthProvider";
import { useWorkspace } from "@/context/WorkspaceProvider";
import { joinWorkspace } from "../action";

export const SearchParamHandler = () => {
	const user = useAuth();
	const search = useSearchParams();
	const invite_id = search.get("invite_id");
	const workspace_id = search.get("workspace_id");
	const [isJoining, startTransition] = useTransition();
	const router = useRouter();
	const {
		workspaces,
		selectedWorkspace,
		setSelectedWorkspaceId,
		isLoading,
		channels,
	} = useWorkspace();
	const workspace = useMemo(() => {
		if (workspace_id) {
			return workspaces.find((item) => item.workspace_id === workspace_id);
		}
	}, [workspace_id, workspaces]);

	useEffect(() => {
		try {
			if (!workspace_id || !workspace || isLoading) return;
			if (!workspaces.length || !workspace)
				throw new Error("Invalid workspace");
			setSelectedWorkspaceId(workspace.workspace_id);
		} catch (error) {
			toast.error(error.message);
			redirect("/home");
		}
	}, [isLoading, setSelectedWorkspaceId, workspace, workspace_id, workspaces]);

	useEffect(() => {
		if (!invite_id || isJoining) return;
		startTransition(async () => {
			try {
				const res = await fetch(`/api/workspace/join/${invite_id}`);
				const json = await res.json();
				if (!json.success || !json.data) throw new Error(json.message);
				const { success, message } = await joinWorkspace({
					user_id: user.user_id,
					workspace_id: json.data.workspace_id,
				});
				if (success) {
					toast.success(message);
					await mutate(`/api/workspace/${user.user_id}`);
					if (selectedWorkspace) {
						channels[selectedWorkspace.workspace_id].send({
							event: "workspace",
							type: "broadcast",
						});
					}
					router.push(`/home?workspace_id=${json.data.workspace_id}`);
				} else {
					throw new Error(message);
				}
			} catch (error) {
				toast.error(error.message);
			}
		});
	}, [channels, invite_id, isJoining, router, selectedWorkspace, user.user_id]);

	return null;
};
