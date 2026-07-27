import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { AuthProvider } from "@/context/AuthProvider";
import { WorkspaceProvider } from "@/context/WorkspaceProvider";
import { Navigator } from "./_components/Navigator";
import { SearchParamHandler } from "./_components/SearchParamHandler";
import { WorkspaceInterface } from "./_components/WorkspaceInterface";
import { WorkspacePanel } from "./_components/WorkspacePanel";
import { WorkspaceTask } from "./_components/WorkspaceTask";

const Page = () => {
	return (
		<AuthProvider>
			<WorkspaceProvider>
				<SearchParamHandler />
				<div className="flex w-full h-dvh flex-col p-30">
					<Card className="flex-1">
						<CardHeader>
							<CardTitle>
								<Navigator />
							</CardTitle>
						</CardHeader>
						<CardContent
							className="grid min-h-0 flex-1 gap-3 grid-cols-3"
							style={{ gridTemplateRows: "auto 1fr" }}
						>
							<WorkspaceInterface>
								<WorkspacePanel />
								<WorkspaceTask />
							</WorkspaceInterface>
						</CardContent>
						<CardFooter className="justify-center">
							<div>
								<span className="text-muted-foreground">Website made by </span>
								<span>Slt8ky</span>
							</div>
						</CardFooter>
					</Card>
				</div>
			</WorkspaceProvider>
		</AuthProvider>
	);
};

export default Page;
