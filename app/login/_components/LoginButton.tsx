"use client";

import { Button } from "@/components/ui/button";
import { login } from "../action";

export const LoginButton = () => {
	const handleLogin = async () => {
		const url = await login();
		console.log(url);
		window.location.href = url;
	};

	return (
		<Button
			variant="default"
			className="w-full"
			type="submit"
			onClick={handleLogin}
		>
			Login with Google
		</Button>
	);
};
