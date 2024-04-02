# @dsbunny/fs
Utility functions wrapping node:fs APIs.

## mkdtempBreaker(prefix: string, minDiskSpace?: number): Promise\<string\>
[Circuit breaker](https://en.wikipedia.org/wiki/Circuit_breaker_design_pattern) wrapper around `node:fs/mkdtemp()` to ensure minimum disk space available.  Target scenario is a job worker that requires an amount of temporary disk space for processing.  If the host is low on disk space the breaker opens, meaning all jobs should be rejected until remediation.

Example usage with [`rimraf()`](https://github.com/isaacs/rimraf):
```TypeScript
import { rimraf } from 'rimraf';
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
	// Cleanup temporary directory.
	await rimraf(tmpdir);
}
```
