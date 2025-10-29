import type { BuildResult } from 'esbuild';

export function prefixBuildResultLogs(buildResult: BuildResult, prefix: 'esbuild'): BuildResult {
  buildResult.errors.forEach((err) => {
    err.text = `[${prefix}] ${err.text}`;
  });
  buildResult.warnings.forEach((warning) => {
    warning.text = `[${prefix}] ${warning.text}`;
  });
  return buildResult;
}
