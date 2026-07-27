"use client";

import { redirect, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
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
	const router = useRouter();
	const { workspaces, setSelectedWorkspace, isLoading } = useWorkspace();
	const workspace = useMemo(() => {
		if (workspace_id) {
			return workspaces.find(
				(workspace) => workspace.workspace_id === workspace_id,
			);
		}
	}, [workspace_id, workspaces]);

	useEffect(() => {
		try {
			if (!workspace_id || !workspace || isLoading) return;
			if (!workspaces.length || !workspace)
				throw new Error("Invalid workspace");
			setSelectedWorkspace(workspace);
		} catch (error) {
			toast.error(error.message);
			redirect("/home");
		}
	}, [
		isLoading,
		setSelectedWorkspace,
		workspace,
		workspace_id,
		workspaces.length,
	]);

	useEffect(() => {
		const handleJoinWorkspace = async () => {
			try {
				if (!invite_id) return;
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
					router.push(`/home?workspace_id=${json.data.workspace_id}`);
				} else {
					throw new Error(message);
				}
			} catch (error) {
				toast.error(error.message);
			}
		};
		handleJoinWorkspace();
	}, [invite_id, user.user_id, router]);
	return null;
};
