import { chmodSync, mkdtempSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, join, relative, sep } from "node:path";

/** Generated reports must never become repository or Next.js static assets. */
export function createPrivateReportDirectory2023(repositoryRoot: string, temporaryRoot: string = tmpdir()): string {
  const repository = realpathSync(repositoryRoot);
  const temporary = realpathSync(temporaryRoot);
  const pathFromRepository = relative(repository, temporary);
  if (pathFromRepository === "" || (!isAbsolute(pathFromRepository) && pathFromRepository !== ".." && !pathFromRepository.startsWith(`..${sep}`))) {
    throw new Error("Direktori sementara berada di dalam repository. Gunakan direktori sementara privat di luar repository.");
  }
  const directory = mkdtempSync(join(temporary, "civx-local-report-"));
  chmodSync(directory, 0o700);
  return directory;
}
