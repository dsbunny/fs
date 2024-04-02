// vim: tabstop=8 softtabstop=0 noexpandtab shiftwidth=8 nosmarttab
// Wrapper around `mkdtemp()` with circuit breaker pattern.

import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import CircuitBreaker from 'opossum';

const circuitBreakerOptions = {
        timeout: 60000, // If our function takes longer than 60 seconds, trigger a failure
        errorThresholdPercentage: 80, // When 80% of requests fail, trip the circuit
        resetTimeout: 30000, // After 30 seconds, try again.
        rollingCountTimeout: 120000,
        rollingCountBuckets: 120,
        volumeThreshold: 10,
};
export const mkdtempBreaker = new CircuitBreaker(mkdtemp, circuitBreakerOptions);

/**
 * Creates a unique temporary directory.
 * @see {@link https://nodejs.org/api/fs.html#fspromisesmkdtempprefix-options} for more information.
 * @param prefix - The prefix of the generated directory name.
 * @param minDiskSpace - Minimum disk space required to create a temporary directory.
 * @returns The created temporary directory path.
 * @throws Error If the disk space is insufficient.
 */
async function mkdtemp(
	prefix: string,
	minDiskSpace?: number,
): Promise<string> {
	const tmpdir = os.tmpdir();
	if(typeof minDiskSpace === 'number') {
		// Verify minimum disk space is available to download file.
		// REF: https://github.com/nodejs/node/issues/50749
		const disk_stats = await fs.statfs(tmpdir);
		const disk_free = disk_stats.bavail * disk_stats.bsize;
		if(disk_free < minDiskSpace) {
			throw new Error('Insufficient disk space.');
		}
	}
	return await fs.mkdtemp(path.join(tmpdir, prefix));
}
