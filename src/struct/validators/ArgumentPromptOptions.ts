import { s } from "@sapphire/shapeshift";

export const ArgumentPromptOptionsValidator = s.object({
	breakout: s.boolean.optional,
	cancel: s.union(s.string, s.any /* function */).optional,
	cancelWord: s.string.optional,
	ended: s.union(s.string, s.any /* function */).optional,
	infinite: s.boolean.optional,
	limit: s.number.optional,
	modifyCancel: s.any.optional /* function */,
	modifyEnded: s.any.optional /* function */,
	modifyRetry: s.any.optional /* function */,
	modifyStart: s.any.optional /* function */,
	modifyTimeout: s.any.optional /* function */,
	optional: s.boolean.optional,
	retries: s.number.optional,
	retry: s.union(s.string, s.any /* function */).optional,
	start: s.union(s.string, s.any /* function */).optional,
	stopWord: s.string.optional,
	time: s.number.optional,
	timeout: s.union(s.string, s.any /* function */).optional
});
