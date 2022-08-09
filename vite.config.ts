import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["tests/unit/**/*.test.ts"],
		passWithNoTests: true,
		coverage: {
			include: ["**/src/**/*.ts"]
		}
	}
});
