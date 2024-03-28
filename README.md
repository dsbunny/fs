# @dsbunny/fs
Utility functions wrapping node:fs APIs.

## mkdtempBreaker(prefix: string, minDiskSpace?: number): Promise\<string\>
Circuit breaker wrapper around `node:fs/mkdtemp()` to ensure minimum disk space available.  Example usage:
```
import { mkdtempBreaker } from '@dsbunny/fs';

let tmpdir: string;
try {
	tmpdir = await mkdtempBreaker.fire('prefix', 5368709120);  // 5GB
	console.log(`Temporary directory created: ${tmpdir}`);
} catch(err: unknown) {
	console.warn(`Failed to create temporary directory: ${
		(err instanceof Error) ? JSON.stringify({
			name: err.name,
			message: err.message,
			stack: err.stack,
			cause: err.cause,
		}) : JSON.stringify({ err })
	}`);
	throw err;
}
try {
	// Perform operations with tmpdir ...
} finally {
	await rimraf(tmpdir);
}
```
