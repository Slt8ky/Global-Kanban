export type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

export type FormResponse<T = undefined> =
	| ([T] extends [undefined]
			? {
					success: true;
					message: string;
					data?: never;
				}
			: {
					success: true;
					message: string;
					data: T;
				})
	| {
			success: false;
			message: string;
			data?: never;
	  };
