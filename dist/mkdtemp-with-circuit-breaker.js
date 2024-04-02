"use strict";
// vim: tabstop=8 softtabstop=0 noexpandtab shiftwidth=8 nosmarttab
// Wrapper around `mkdtemp()` with circuit breaker pattern.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mkdtempBreaker = void 0;
const promises_1 = __importDefault(require("node:fs/promises"));
const node_path_1 = __importDefault(require("node:path"));
const node_os_1 = __importDefault(require("node:os"));
const opossum_1 = __importDefault(require("opossum"));
const circuitBreakerOptions = {
    timeout: 60000, // If our function takes longer than 60 seconds, trigger a failure
    errorThresholdPercentage: 80, // When 80% of requests fail, trip the circuit
    resetTimeout: 30000, // After 30 seconds, try again.
    rollingCountTimeout: 120000,
    rollingCountBuckets: 120,
    volumeThreshold: 10,
};
exports.mkdtempBreaker = new opossum_1.default(mkdtemp, circuitBreakerOptions);
/**
 * Creates a unique temporary directory.
 * @see {@link https://nodejs.org/api/fs.html#fspromisesmkdtempprefix-options} for more information.
 * @param prefix - The prefix of the generated directory name.
 * @param minDiskSpace - Minimum disk space required to create a temporary directory.
 * @returns The created temporary directory path.
 * @throws Error If the disk space is insufficient.
 */
async function mkdtemp(prefix, minDiskSpace) {
    const tmpdir = node_os_1.default.tmpdir();
    if (typeof minDiskSpace === 'number') {
        // Verify minimum disk space is available to download file.
        // REF: https://github.com/nodejs/node/issues/50749
        const disk_stats = await promises_1.default.statfs(tmpdir);
        const disk_free = disk_stats.bavail * disk_stats.bsize;
        if (disk_free < minDiskSpace) {
            throw new Error('Insufficient disk space.');
        }
    }
    return await promises_1.default.mkdtemp(node_path_1.default.join(tmpdir, prefix));
}
//# sourceMappingURL=mkdtemp-with-circuit-breaker.js.map