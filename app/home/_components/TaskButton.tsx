"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspace } from "@/context/WorkspaceProvider";

export const TaskCreateButton = () => {
	const { selectedWorkspace } = useWorkspace();
	if (!selectedWorkspace) return null;
	return (
		<Dialog>
			<form>
				<DialogTrigger
					render={
						<Button className="min-h-0" size="icon-sm">
							<Plus />
						</Button>
					}
				/>
				<DialogContent className="sm:max-w-sm">
					<DialogHeader>
						<DialogTitle>Add Task</DialogTitle>
					</DialogHeader>
					<FieldGroup>
						<Field>
							<Label htmlFor="name">Task Name</Label>
							<Input id="name" name="name" />
						</Field>
						<Field>
							<Label htmlFor="description">Task Description</Label>
							<Textarea
								className="max-h-80"
								id="description"
								name="description"
							/>
						</Field>
						<Field>
							<Label htmlFor="task_assign">Task Assign</Label>
							<Input id="task_assign" name="task_assign" />
						</Field>
					</FieldGroup>
					<DialogFooter>
						<DialogClose render={<Button variant="outline">Cancel</Button>} />
						<Button type="submit">Save changes</Button>
					</DialogFooter>
				</DialogContent>
			</form>
		</Dialog>
	);
};
