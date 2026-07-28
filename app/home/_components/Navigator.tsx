import { UserInfo } from "./UserInfo";
import { WorkspaceCreateButton } from "./WorkspaceButton";
import { WorkspaceSelect } from "./WorkspaceSelect";

export const Navigator = () => {
	return (
		<div className="flex justify-between items-center">
			<div className="flex gap-3 items-center">
				<div>Global Kanban</div>
				<WorkspaceSelect />
				<WorkspaceCreateButton />
			</div>
			<UserInfo />
		</div>
	);
};
