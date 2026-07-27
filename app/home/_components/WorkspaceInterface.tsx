"use client";

import { Zap } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { useWorkspace } from "@/context/WorkspaceProvider";
export const WorkspaceInterface = ({ children }: { children: ReactNode }) => {
	const { selectedWorkspace, isLoading } = useWorkspace();

	return (
		<>
			{isLoading ? (
				<>
					<Card className="shimmer shimmer-bg shimmer-color-background/20 h-20 col-span-3">
						<CardContent></CardContent>
					</Card>
					<Card className="shimmer shimmer-bg shimmer-color-background/20 ">
						<CardContent></CardContent>
					</Card>
					<Card className="shimmer shimmer-bg shimmer-color-background/20 ">
						<CardContent></CardContent>
					</Card>
					<Card className="shimmer shimmer-bg shimmer-color-background/20 ">
						<CardContent></CardContent>
					</Card>
				</>
			) : !selectedWorkspace ? (
				<Empty className="row-span-2 col-span-3">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Zap />
						</EmptyMedia>
						<EmptyTitle>No workspace found</EmptyTitle>
						<EmptyDescription>
							Select a workspace or create a new one
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : (
				children
			)}
		</>
	);
};
