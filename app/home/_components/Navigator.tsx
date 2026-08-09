import { UserInfo } from "./UserInfo";
import { WorkspaceCreateButton } from "./WorkspaceButton";
import { WorkspaceSelect } from "./WorkspaceSelect";

export const Navigator = () => {
	return (
		<div className="flex gap-3 justify-between items-center flex-wrap">
			<div className="flex gap-3 items-center">
				<div>Global Kanban</div>
				<WorkspaceSelect />
				<WorkspaceCreateButton />
			</div>
			<UserInfo />
		</div>
	);
};
