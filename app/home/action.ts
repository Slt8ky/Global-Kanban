"use server";

import type { TablesInsert } from "@/database.types";
import type { FormResponse } from "@/lib/types";
import { supabase } from "@/utils/supabase/admin";
import type { Workspace } from "../api/workspace/[id]/route";

export const createWorkspace = async (
	payload: TablesInsert<"workspace">,
): Promise<FormResponse<string>> => {
	try {
		Object.values(payload).map((e) => {
			if (!e.trim().length) throw new Error("Fill in all the fields.");
		});
		const { name, user_id } = payload;
		const { data: workspaceRows, error: workspaceError } = await supabase
			.from("workspace")
			.insert({
				name,
				user_id,
			})
			.select("*");
		if (workspaceError) throw workspaceError;
		const [workspaceRow] = workspaceRows;
		const { error: workspaceMemberError } = await supabase
			.from("workspace_member")
			.insert({
				user_id,
				workspace_id: workspaceRow.workspace_id,
			});
		if (workspaceMemberError) throw workspaceMemberError;
		return {
			success: true,
			message: `Created workspace - ${workspaceRow.name}`,
			data: workspaceRow.workspace_id,
		};
	} catch (error) {
		return {
			success: false,
			message: error.message,
		};
	}
};

export const createTask = async (payload: TablesInsert<"task">) => {
	await supabase.from("task").insert(payload);
};

export const joinWorkspace = async (
	payload: TablesInsert<"workspace_member">,
): Promise<FormResponse> => {
	try {
		const { data, error: selectError } = await supabase
			.from("workspace_member")
			.select()
			.match({
				workspace_id: payload.workspace_id,
				user_id: [payload.user_id],
			});
		if (selectError) {
			throw selectError;
		} else if (data.length) {
			throw new Error("You already is a member of the workspace");
		}
		const { error: insertError } = await supabase
			.from("workspace_member")
			.insert(payload);
		if (insertError) throw insertError;
		return {
			success: true,
			message: "Joining workspace...",
		};
	} catch (error) {
		return {
			success: false,
			message: error.message,
		};
	}
};

export const leaveWorkspace = async (
	payload: TablesInsert<"workspace_member">,
): Promise<FormResponse> => {
	try {
		const { error } = await supabase.from("workspace_member").delete().match({
			user_id: payload.user_id,
			workspace_id: payload.workspace_id,
		});
		if (error) throw error;
		return {
			success: true,
			message: "Quited a workspace successfully.",
		};
	} catch (error) {
		return {
			success: false,
			message: error.message,
		};
	}
};
