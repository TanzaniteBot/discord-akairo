import { defineConfig } from "vite";

export default defineConfig({
	test: {
		include: ["**/tests/**/*test.ts"],
		passWithNoTests: true,
		coverage: {
			include: ["**/src/**/*.ts"]
		}
	}
});
