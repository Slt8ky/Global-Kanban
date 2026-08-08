import {
	createColumnHelper,
	type PaginationState,
	type RowSelectionState,
	rowPaginationFeature,
	tableFeatures,
	useTable,
} from "@tanstack/react-table";
import {
	Check,
	Ellipsis,
	LayoutGrid,
	Mail,
	User as UserIcon,
	X,
} from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

type UserTableData = {
	user: Tables<"user">;
	workspace: Workspace;
	to_do: number;
	in_progress: number;
	done: number;
};

import { rowSelectionFeature } from "@tanstack/react-table";
import { useState } from "react";
import type { Workspace } from "@/app/api/workspace/[user_id]/route";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthProvider";
import { useWorkspace } from "@/context/WorkspaceProvider";
import type { Tables } from "@/database.types";
import { cn } from "@/lib/utils";
import { UserKickButton } from "./UserButton";

const features = tableFeatures({ rowSelectionFeature, rowPaginationFeature });
const columnHelper = createColumnHelper<typeof features, UserTableData>();

export const UserTable = ({
	data,
	callback,
}: {
	data: UserTableData[];
	callback: () => void;
}) => {
	const user = useAuth();
	const { selectedWorkspace } = useWorkspace();
	const isOwner = selectedWorkspace?.workspace.user_id === user.user_id;
	const columns = columnHelper.columns([
		{
			id: "select-col",
			header: ({ table }) => (
				<Checkbox
					checked={table.getIsAllRowsSelected()}
					indeterminate={table.getIsSomeRowsSelected()}
					onClick={table.getToggleAllRowsSelectedHandler()}
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					disabled={!row.getCanSelect()}
					indeterminate={row.getIsSomeSelected()}
					onClick={row.getToggleSelectedHandler()}
					className={cn(!row.getCanSelect() && "opacity-50")}
				/>
			),
		},
		columnHelper.accessor("user.name", {
			header: () => (
				<div className="flex gap-1 items-center">
					<UserIcon size={16} />
					USER NAME
				</div>
			),
			cell: ({ row }) => (
				<div className="flex gap-2 items-center">
					<Avatar size="sm">
						<AvatarImage src={row.original.user.picture} />
						<AvatarFallback>
							<UserIcon size={15} />
						</AvatarFallback>
					</Avatar>
					{row.original.user.name}
				</div>
			),
		}),
		columnHelper.accessor("user.email", {
			header: () => (
				<div className="flex gap-1 items-center">
					<Mail size={16} />
					USER EMAIL
				</div>
			),
		}),
		columnHelper.accessor("to_do", {
			header: () => (
				<div className="flex gap-1 items-center">
					<X size={16} />
					TO DO
				</div>
			),
		}),
		columnHelper.accessor("in_progress", {
			header: () => (
				<div className="flex gap-1 items-center">
					<Ellipsis size={16} />
					IN PROGRESS
				</div>
			),
		}),
		columnHelper.accessor("done", {
			header: () => (
				<div className="flex gap-1 items-center">
					<Check size={16} />
					DONE
				</div>
			),
		}),
		{
			id: "ACTIONS",
			header: () => (
				<div className="flex gap-1 items-center">
					<LayoutGrid size={16} />
					ACTIONS
				</div>
			),
			cell: ({ row, table }) => (
				<Tooltip>
					<TooltipTrigger
						render={
							<div>
								<UserKickButton
									user_ids={[row.original.user.user_id]}
									workspace={row.original.workspace}
									disabled={
										row.original.user.user_id ===
										selectedWorkspace?.workspace.user.user_id
									}
									className="w-full rounded-sm"
									callback={() => {
										if (table.getSelectedRowIds().length)
											table.getToggleAllRowsSelectedHandler();
										callback();
									}}
								>
									Kick
								</UserKickButton>
							</div>
						}
					/>
					{row.original.user.user_id ===
						selectedWorkspace?.workspace.user.user_id && (
						<TooltipContent>
							<p>You are the workspace owner</p>
						</TooltipContent>
					)}
				</Tooltip>
			),
		},
	]);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const table = useTable(
		{
			features,
			columns,
			data,
			onRowSelectionChange: setRowSelection,
			getRowId: (row) => row.user.user_id,
			state: {
				rowSelection,
				pagination,
			},
			manualPagination: true,
			enableRowSelection: (row) =>
				row.original.user.user_id !== selectedWorkspace?.workspace.user.user_id,
		},
		(state) => state,
	);
	return (
		selectedWorkspace && (
			<div className="flex gap-2 flex-col">
				<div className="h-100 border rounded-2xl overflow-hidden font-mono">
					<Table>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers
										.slice(isOwner ? 0 : 1, isOwner ? undefined : -1)
										.map((header) => (
											<TableHead key={header.id} className="p-3">
												{header.isPlaceholder ? null : (
													<table.FlexRender header={header} />
												)}
											</TableHead>
										))}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{table.getRowModel().rows.map((row) => (
								<TableRow key={row.id}>
									{row
										.getAllCells()
										.slice(isOwner ? 0 : 1, isOwner ? undefined : -1)
										.map((cell) => (
											<TableCell key={cell.id} className="px-3">
												<table.FlexRender cell={cell} />
											</TableCell>
										))}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
				<div className="flex justify-between items-center">
					{isOwner && (
						<>
							<span className="text-muted-foreground">
								{`${Object.keys(table.state.rowSelection).length.toLocaleString()} of ${table.getPreFilteredRowModel().rows.length.toLocaleString()} Rows Selected`}
							</span>
							<UserKickButton
								user_ids={table.getSelectedRowIds()}
								workspace={selectedWorkspace}
								disabled={!Object.keys(table.state.rowSelection).length}
								className={"min-w-20 rounded-sm"}
								callback={() => {
									if (Object.keys(table.state.rowSelection).length)
										table.getToggleAllRowsSelectedHandler();
									callback();
								}}
							>
								{Object.keys(table.state.rowSelection).length
									? `Kick ${Object.keys(table.state.rowSelection).length} member(s)`
									: "Kick"}
							</UserKickButton>
						</>
					)}
				</div>
			</div>
		)
	);
};
