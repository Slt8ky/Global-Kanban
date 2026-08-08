"use client";
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthProvider";
import { Logout } from "./Logout";

export const UserInfo = () => {
	const user = useAuth();
	return (
		<div className="flex gap-3 items-center">
			<Badge>{user.user_id}</Badge>
			<div>{user.name}</div>
			<Avatar>
				<AvatarImage src={user.picture} />
				<AvatarFallback>
					<User />
				</AvatarFallback>
			</Avatar>
			<Logout />
		</div>
	);
};
