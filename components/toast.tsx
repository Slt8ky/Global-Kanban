import { toast as st } from "sonner";

export const toast = {
	success: (message: string | false) => {
		st.success(message, {
			style: {
				"--normal-bg":
					"color-mix(in oklab, light-dark(var(--color-green-600), var(--color-green-400)) 10%, var(--background))",
				"--normal-text":
					"light-dark(var(--color-green-600), var(--color-green-400))",
				"--normal-border":
					"light-dark(var(--color-green-600), var(--color-green-400))",
			} as React.CSSProperties,
			position: "top-center",
		});
	},
	warning: (message: string | false) => {
		st.warning(message, {
			style: {
				"--normal-bg":
					"color-mix(in oklab, light-dark(var(--color-amber-600), var(--color-amber-400)) 10%, var(--background))",
				"--normal-text":
					"light-dark(var(--color-amber-600), var(--color-amber-400))",
				"--normal-border":
					"light-dark(var(--color-amber-600), var(--color-amber-400))",
			} as React.CSSProperties,
			position: "top-center",
		});
	},
	error: (message: string | false) => {
		st.error(message, {
			style: {
				"--normal-bg":
					"color-mix(in oklab, var(--destructive) 10%, var(--background))",
				"--normal-text": "var(--destructive)",
				"--normal-border": "var(--destructive)",
			} as React.CSSProperties,
			position: "top-center",
		});
	},
};
