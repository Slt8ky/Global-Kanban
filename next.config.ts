import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	turbopack: {
		root: process.cwd(),
	},
	allowedDevOrigins: ["slt8ky.mooo.com"],
	logging: {
		browserToTerminal: true,
	},
	reactStrictMode: false,
	images: {
		unoptimized: true,
	},
};

export default nextConfig;
