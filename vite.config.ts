import { defineConfig } from "vite";

export default defineConfig({
	test: {
		include: ["**/tests/unit/**/*test.ts"],
		passWithNoTests: true,
		coverage: {
			include: ["**/src/**/*.ts"]
		}
	}
});
