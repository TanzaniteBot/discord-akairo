"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Messages = {
	// Module-related
	FILE_NOT_FOUND: filename => `File '${filename}' not found`,
	MODULE_NOT_FOUND: (constructor, id) =>
		`${constructor} '${id}' does not exist`,
	ALREADY_LOADED: (constructor, id) =>
		`${constructor} '${id}' is already loaded`,
	NOT_RELOADABLE: (constructor, id) =>
		`${constructor} '${id}' is not reloadable`,
	INVALID_CLASS_TO_HANDLE: (given, expected) =>
		`Class to handle ${given} is not a subclass of ${expected}`,
	// Command-related
	ALIAS_CONFLICT: (alias, id, conflict) =>
		`Alias '${alias}' of '${id}' already exists on '${conflict}'`,
	// Options-related
	COMMAND_UTIL_EXPLICIT:
		"The command handler options `handleEdits` and `storeMessages` require the `commandUtil` option to be true",
	UNKNOWN_MATCH_TYPE: match => `Unknown match type '${match}'`,
	// Generic errors
	NOT_INSTANTIABLE: constructor => `${constructor} is not instantiable`,
	NOT_IMPLEMENTED: (constructor, method) =>
		`${constructor}#${method} has not been implemented`,
	INVALID_TYPE: (name, expected, vowel = false) =>
		`Value of '${name}' was not ${vowel ? "an" : "a"} ${expected}`
};
/**
 * Represents an error for Akairo.
 * @param key - Error key.
 * @param args - Arguments.
 */
class AkairoError extends Error {
	code;
	get name() {
		return `AkairoError [${this.code}]`;
	}
	constructor(key, ...args) {
		if (Messages[key] == null)
			throw new TypeError(`Error key '${key}' does not exist`);
		const message =
			typeof Messages[key] === "function"
				? Messages[key](...args)
				: Messages[key];
		super(message);
		this.code = key;
	}
}
exports.default = AkairoError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWthaXJvRXJyb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbC9Ba2Fpcm9FcnJvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE1BQU0sUUFBUSxHQUFHO0lBQ2hCLGlCQUFpQjtJQUNqQixjQUFjLEVBQUUsQ0FBQyxRQUFhLEVBQUUsRUFBRSxDQUFDLFNBQVMsUUFBUSxhQUFhO0lBQ2pFLGdCQUFnQixFQUFFLENBQUMsV0FBZ0IsRUFBRSxFQUFPLEVBQUUsRUFBRSxDQUMvQyxHQUFHLFdBQVcsS0FBSyxFQUFFLGtCQUFrQjtJQUN4QyxjQUFjLEVBQUUsQ0FBQyxXQUFnQixFQUFFLEVBQU8sRUFBRSxFQUFFLENBQzdDLEdBQUcsV0FBVyxLQUFLLEVBQUUscUJBQXFCO0lBQzNDLGNBQWMsRUFBRSxDQUFDLFdBQWdCLEVBQUUsRUFBTyxFQUFFLEVBQUUsQ0FDN0MsR0FBRyxXQUFXLEtBQUssRUFBRSxxQkFBcUI7SUFDM0MsdUJBQXVCLEVBQUUsQ0FBQyxLQUFVLEVBQUUsUUFBYSxFQUFFLEVBQUUsQ0FDdEQsbUJBQW1CLEtBQUsseUJBQXlCLFFBQVEsRUFBRTtJQUU1RCxrQkFBa0I7SUFDbEIsY0FBYyxFQUFFLENBQUMsS0FBVSxFQUFFLEVBQU8sRUFBRSxRQUFhLEVBQUUsRUFBRSxDQUN0RCxVQUFVLEtBQUssU0FBUyxFQUFFLHdCQUF3QixRQUFRLEdBQUc7SUFFOUQsa0JBQWtCO0lBQ2xCLHFCQUFxQixFQUNwQiwyR0FBMkc7SUFDNUcsa0JBQWtCLEVBQUUsQ0FBQyxLQUFVLEVBQUUsRUFBRSxDQUFDLHVCQUF1QixLQUFLLEdBQUc7SUFFbkUsaUJBQWlCO0lBQ2pCLGdCQUFnQixFQUFFLENBQUMsV0FBZ0IsRUFBRSxFQUFFLENBQUMsR0FBRyxXQUFXLHNCQUFzQjtJQUM1RSxlQUFlLEVBQUUsQ0FBQyxXQUFnQixFQUFFLE1BQVcsRUFBRSxFQUFFLENBQ2xELEdBQUcsV0FBVyxJQUFJLE1BQU0sMkJBQTJCO0lBQ3BELFlBQVksRUFBRSxDQUFDLElBQVMsRUFBRSxRQUFhLEVBQUUsS0FBSyxHQUFHLEtBQUssRUFBRSxFQUFFLENBQ3pELGFBQWEsSUFBSSxhQUFhLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksUUFBUSxFQUFFO0NBQy9ELENBQUM7QUFFRjs7OztHQUlHO0FBQ0gsTUFBcUIsV0FBWSxTQUFRLEtBQUs7SUFDdEMsSUFBSSxDQUFTO0lBRXBCLElBQW9CLElBQUk7UUFDdkIsT0FBTyxnQkFBZ0IsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDO0lBQ3JDLENBQUM7SUFFRCxZQUFtQixHQUFXLEVBQUUsR0FBRyxJQUEwQjtRQUM1RCxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJO1lBQ3hCLE1BQU0sSUFBSSxTQUFTLENBQUMsY0FBYyxHQUFHLGtCQUFrQixDQUFDLENBQUM7UUFDMUQsTUFBTSxPQUFPLEdBQ1osT0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssVUFBVTtZQUNsQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQ3hCLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFbEIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2YsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUM7SUFDakIsQ0FBQztDQUNEO0FBbEJELDhCQWtCQyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IE1lc3NhZ2VzID0ge1xuXHQvLyBNb2R1bGUtcmVsYXRlZFxuXHRGSUxFX05PVF9GT1VORDogKGZpbGVuYW1lOiBhbnkpID0+IGBGaWxlICcke2ZpbGVuYW1lfScgbm90IGZvdW5kYCxcblx0TU9EVUxFX05PVF9GT1VORDogKGNvbnN0cnVjdG9yOiBhbnksIGlkOiBhbnkpID0+XG5cdFx0YCR7Y29uc3RydWN0b3J9ICcke2lkfScgZG9lcyBub3QgZXhpc3RgLFxuXHRBTFJFQURZX0xPQURFRDogKGNvbnN0cnVjdG9yOiBhbnksIGlkOiBhbnkpID0+XG5cdFx0YCR7Y29uc3RydWN0b3J9ICcke2lkfScgaXMgYWxyZWFkeSBsb2FkZWRgLFxuXHROT1RfUkVMT0FEQUJMRTogKGNvbnN0cnVjdG9yOiBhbnksIGlkOiBhbnkpID0+XG5cdFx0YCR7Y29uc3RydWN0b3J9ICcke2lkfScgaXMgbm90IHJlbG9hZGFibGVgLFxuXHRJTlZBTElEX0NMQVNTX1RPX0hBTkRMRTogKGdpdmVuOiBhbnksIGV4cGVjdGVkOiBhbnkpID0+XG5cdFx0YENsYXNzIHRvIGhhbmRsZSAke2dpdmVufSBpcyBub3QgYSBzdWJjbGFzcyBvZiAke2V4cGVjdGVkfWAsXG5cblx0Ly8gQ29tbWFuZC1yZWxhdGVkXG5cdEFMSUFTX0NPTkZMSUNUOiAoYWxpYXM6IGFueSwgaWQ6IGFueSwgY29uZmxpY3Q6IGFueSkgPT5cblx0XHRgQWxpYXMgJyR7YWxpYXN9JyBvZiAnJHtpZH0nIGFscmVhZHkgZXhpc3RzIG9uICcke2NvbmZsaWN0fSdgLFxuXG5cdC8vIE9wdGlvbnMtcmVsYXRlZFxuXHRDT01NQU5EX1VUSUxfRVhQTElDSVQ6XG5cdFx0XCJUaGUgY29tbWFuZCBoYW5kbGVyIG9wdGlvbnMgYGhhbmRsZUVkaXRzYCBhbmQgYHN0b3JlTWVzc2FnZXNgIHJlcXVpcmUgdGhlIGBjb21tYW5kVXRpbGAgb3B0aW9uIHRvIGJlIHRydWVcIixcblx0VU5LTk9XTl9NQVRDSF9UWVBFOiAobWF0Y2g6IGFueSkgPT4gYFVua25vd24gbWF0Y2ggdHlwZSAnJHttYXRjaH0nYCxcblxuXHQvLyBHZW5lcmljIGVycm9yc1xuXHROT1RfSU5TVEFOVElBQkxFOiAoY29uc3RydWN0b3I6IGFueSkgPT4gYCR7Y29uc3RydWN0b3J9IGlzIG5vdCBpbnN0YW50aWFibGVgLFxuXHROT1RfSU1QTEVNRU5URUQ6IChjb25zdHJ1Y3RvcjogYW55LCBtZXRob2Q6IGFueSkgPT5cblx0XHRgJHtjb25zdHJ1Y3Rvcn0jJHttZXRob2R9IGhhcyBub3QgYmVlbiBpbXBsZW1lbnRlZGAsXG5cdElOVkFMSURfVFlQRTogKG5hbWU6IGFueSwgZXhwZWN0ZWQ6IGFueSwgdm93ZWwgPSBmYWxzZSkgPT5cblx0XHRgVmFsdWUgb2YgJyR7bmFtZX0nIHdhcyBub3QgJHt2b3dlbCA/IFwiYW5cIiA6IFwiYVwifSAke2V4cGVjdGVkfWBcbn07XG5cbi8qKlxuICogUmVwcmVzZW50cyBhbiBlcnJvciBmb3IgQWthaXJvLlxuICogQHBhcmFtIGtleSAtIEVycm9yIGtleS5cbiAqIEBwYXJhbSBhcmdzIC0gQXJndW1lbnRzLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBa2Fpcm9FcnJvciBleHRlbmRzIEVycm9yIHtcblx0cHVibGljIGNvZGU6IHN0cmluZztcblxuXHRwdWJsaWMgb3ZlcnJpZGUgZ2V0IG5hbWUoKSB7XG5cdFx0cmV0dXJuIGBBa2Fpcm9FcnJvciBbJHt0aGlzLmNvZGV9XWA7XG5cdH1cblxuXHRwdWJsaWMgY29uc3RydWN0b3Ioa2V5OiBzdHJpbmcsIC4uLmFyZ3M6IChzdHJpbmcgfCBib29sZWFuKVtdKSB7XG5cdFx0aWYgKE1lc3NhZ2VzW2tleV0gPT0gbnVsbClcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoYEVycm9yIGtleSAnJHtrZXl9JyBkb2VzIG5vdCBleGlzdGApO1xuXHRcdGNvbnN0IG1lc3NhZ2UgPVxuXHRcdFx0dHlwZW9mIE1lc3NhZ2VzW2tleV0gPT09IFwiZnVuY3Rpb25cIlxuXHRcdFx0XHQ/IE1lc3NhZ2VzW2tleV0oLi4uYXJncylcblx0XHRcdFx0OiBNZXNzYWdlc1trZXldO1xuXG5cdFx0c3VwZXIobWVzc2FnZSk7XG5cdFx0dGhpcy5jb2RlID0ga2V5O1xuXHR9XG59XG4iXX0=
