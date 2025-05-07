import { writeFileSync, existsSync, mkdirSync, readFileSync } from "fs";
import linqq from "src";

type BenchmarkResult = {
  label: string;
  iterations: number;
  linqq: SingleResult;
  native: SingleResult;
};

type SingleResult = {
  avgTimeMs: number;
  minTimeMs: number;
  maxTimeMs: number;
  avgMemMb: number;
  maxMemMb: number;
  functionStr: string;
};

type BenchmarkTest<TInput, TResult> = {
  label: string;
  prepareInput: () => TInput;
  expected?: (input: TInput) => TResult;
  linqq: (input: TInput) => TResult;
  native: (input: TInput) => TResult;
  iterations?: number;
  quiet?: boolean;
};

const RESULTS_PATH = "./benchmarks/benchmark-results.json";

function getMemoryUsage(): number {
  return process.memoryUsage().heapUsed;
}

export async function benchmarkCompare<TInput, TResult>(test: BenchmarkTest<TInput, TResult>): Promise<void> {
  const iterations = test.iterations ?? 10;
  const quiet = test.quiet ?? false;
  const log = !quiet ? console.log : (...args: any[]) => {};
  log(`\nRunning ${iterations} iterations for "${test.label}"...`);

  const memSupported = typeof process !== "undefined" && typeof process.memoryUsage === "function";

  async function runSingle(name: string, fn: (input: TInput) => TResult) {
    const times = linqq.empty<number>().toExtendedList();
    const mems = linqq.empty<number>().toExtendedList();

    linqq
      .range(0, iterations)
      .toList()
      .forEach((i) => {
        const input = test.prepareInput();

        const startMem = memSupported ? getMemoryUsage() : 0;
        const start = performance.now();

        const result = fn(input);

        const end = performance.now();
        const endMem = memSupported ? getMemoryUsage() : 0;

        times.add(end - start);
        mems.add((endMem - startMem) / (1024 * 1024));

        // Optionally check correctness
        if (test.expected) {
          const expected = test.expected(input);
          if (JSON.stringify(result) !== JSON.stringify(expected)) {
            console.warn(`⚠️ ${name} implementation produced incorrect result on iteration ${i + 1}`);
          }
        }
      });

    const avgTime = times.average();
    const { min: minTime, max: maxTime } = times.minMax();

    const avgMem = mems.average();
    const maxMem = mems.max();

    log(
      `✅ ${name}: ran ${iterations} times. Avg: ${formatMs(avgTime)} (Min: ${formatMs(minTime)}, Max: ${formatMs(maxTime)}), Mem: ~${formatBytes(avgMem)} avg, up to ${formatBytes(maxMem)} max.`,
    );

    return {
      avgTimeMs: avgTime,
      minTimeMs: minTime,
      maxTimeMs: maxTime,
      avgMemMb: avgMem,
      maxMemMb: maxMem,
      functionStr: fn.toString(),
    };
  }

  const linqqRes = await runSingle("Linqq", test.linqq);
  const nativeRes = await runSingle("Native", test.native);

  const newResult: BenchmarkResult = {
    label: test.label,
    iterations,
    linqq: linqqRes,
    native: nativeRes,
  };

  dumpResult(newResult, log);
}

function dumpResult(newResult: BenchmarkResult, log: (message: string) => void): void {
  const outDir = "./benchmarks";
  if (!existsSync(outDir)) {
    mkdirSync(outDir);
  }

  let allResults: Record<string, BenchmarkResult> = {};

  if (existsSync(RESULTS_PATH)) {
    const existingRaw = readFileSync(RESULTS_PATH, "utf-8");
    try {
      const parsed = JSON.parse(existingRaw);
      if (typeof parsed === "object" && !Array.isArray(parsed)) {
        allResults = parsed;
      }
    } catch {
      console.warn("⚠️ Could not parse existing benchmark-results.json. Overwriting...");
    }
  }

  // Merge/update by label
  allResults[newResult.label] = newResult;

  writeFileSync(RESULTS_PATH, JSON.stringify(allResults, null, 2), "utf-8");
  const linqFaster = newResult.linqq.avgTimeMs < newResult.native.avgTimeMs;
  const diffMagnitude = (
    linqFaster
      ? newResult.native.avgTimeMs / newResult.linqq.avgTimeMs
      : newResult.linqq.avgTimeMs / newResult.native.avgTimeMs
  ).toFixed(2);

  log(linqFaster ? `Linqq is ${diffMagnitude}x faster` : `Native is ${diffMagnitude}x faster`);
}

function formatMs(ms: number): string {
  const seconds = ms / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;

  if (hours >= 1) {
    return `${hours.toFixed(2)} hours`;
  } else if (minutes >= 1) {
    return `${minutes.toFixed(2)} minutes`;
  } else if (seconds >= 1) {
    return `${seconds.toFixed(2)} seconds`;
  } else {
    return `${ms.toFixed(3)} milliseconds`;
  }
}

function formatBytes(bytes: number): string {
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  while (bytes >= 1024 && i < sizes.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(2)} ${sizes[i]}`;
}
