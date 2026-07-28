"use server";

import type { Prettify } from "@supabase/supabase-js";
import type { Tables, TablesInsert, TablesUpdate } from "@/database.types";
import type { FormResponse } from "@/lib/types";
import { supabase } from "@/utils/supabase/admin";
import type { Workspace } from "../api/workspace/[user_id]/route";

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

export const deleteWorkspace = async (
	payload: Workspace,
): Promise<FormResponse> => {
	try {
		const { error } = await supabase
			.from("workspace")
			.delete()
			.eq("workspace_id", payload.workspace_id);
		if (error) throw error;
		return {
			success: true,
			message: `Deleted workspace - ${payload.workspace.name}`,
		};
	} catch (error) {
		return {
			success: false,
			message: error.message,
		};
	}
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

export const createTask = async (payload: {
	task: TablesInsert<"task">;
	task_assign: Prettify<Omit<TablesInsert<"task_assign">, "task_id">>[];
}): Promise<FormResponse<Tables<"task">>> => {
	try {
		const { data: tasks, error: taskError } = await supabase
			.from("task")
			.insert(payload.task)
			.select();
		if (taskError) throw taskError;
		const [task] = tasks;
		if (payload.task_assign.length) {
			const { error: taskAssignError } = await supabase
				.from("task_assign")
				.insert(
					payload.task_assign.map((item) => ({
						task_id: task.task_id,
						user_id: item.user_id,
					})),
				);
			if (taskAssignError) throw taskAssignError;
		}
		return {
			success: true,
			message: `Added task - ${task.name}`,
			data: task,
		};
	} catch (error) {
		return {
			success: false,
			message: error.message,
		};
	}
};

export const changeTaskStatus = async (payload: {
	task: Prettify<
		TablesUpdate<"task"> &
			Required<Pick<TablesUpdate<"task">, "task_status_id" | "task_id">>
	>;
	status: string;
}): Promise<FormResponse> => {
	try {
		const { error } = await supabase
			.from("task")
			.update({
				task_status_id: payload.status,
			})
			.eq("task_id", payload.task.task_id);
		if (error) throw error;
		return {
			success: true,
			message: `Changed Task - ${payload.task.name} status to ${payload.status}`,
		};
	} catch (error) {
		return {
			success: false,
			message: error.message,
		};
	}
};

export const deleteTask = async (
	payload: Workspace["workspace"]["task"][number],
): Promise<FormResponse> => {
	try {
		const { error } = await supabase
			.from("task")
			.delete()
			.eq("task_id", payload.task_id);
		if (error) throw error;
		return {
			success: true,
			message: `Deleted task - ${payload.name}`,
		};
	} catch (error) {
		return {
			success: false,
			message: error.message,
		};
	}
};

export const editTask = async (payload: {
	task: Prettify<
		TablesUpdate<"task"> & Required<Pick<TablesUpdate<"task">, "task_id">>
	>;
	task_assign: TablesInsert<"task_assign">[];
}): Promise<FormResponse> => {
	try {
		const { error: taskError } = await supabase
			.from("task")
			.update(payload.task)
			.eq("task_id", payload.task.task_id);
		if (taskError) throw taskError;
		const { error: taskAssignDeleteError } = await supabase
			.from("task_assign")
			.delete()
			.eq("task_id", payload.task.task_id);
		if (taskAssignDeleteError) throw taskError;
		const { error: taskAssignInsertError } = await supabase
			.from("task_assign")
			.insert(payload.task_assign);
		if (taskAssignInsertError) throw taskError;
		return {
			success: true,
			message: `Edited task successfully`,
		};
	} catch (error) {
		return {
			success: false,
			message: error.message,
		};
	}
};
