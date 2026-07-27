import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { LoginButton } from "./_components/LoginButton";

const Page = () => {
	return (
		<div className="flex w-full h-dvh justify-center items-center">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle>Global Kanban</CardTitle>
					<CardDescription>Login to start begin</CardDescription>
				</CardHeader>
				<CardFooter className="flex-col gap-2">
					<LoginButton/>
				</CardFooter>
			</Card>
		</div>
	);
};

export default Page;
