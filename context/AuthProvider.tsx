"use client";

import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import type { User } from "@/app/api/user/[user_id]/route";

const AuthContext = createContext<User | null>(null);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) throw new Error("Authentication Error");
	return context;
};

const fetchUser = async (controller: AbortController) => {
	const res = await fetch(`/api/user`, {
		method: "PUT",
		signal: controller.signal,
	});
	const data = await res.json();
	return data;
};

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		const controller = new AbortController();
		fetchUser(controller).then((user) => setUser(user));
		return () => controller.abort();
	}, []);

	return (
		user && <AuthContext.Provider value={user}>{children}</AuthContext.Provider>
	);
};
