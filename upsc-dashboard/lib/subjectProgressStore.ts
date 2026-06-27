import { promises as fs } from "node:fs";
import path from "node:path";

export interface StoredSubjectProgress {
  checkedUids: string[];
  completionTimes: Record<
    string,
    { completedAt: number; revisedAt?: number; revisions?: number[] }
  >;
  updatedAt: number;
}

type ProgressFile = Record<string, StoredSubjectProgress>;

const dataDirectory = path.join(process.cwd(), ".dashboard-data");
const dataFile = path.join(dataDirectory, "subject-progress.json");
let writeQueue: Promise<void> = Promise.resolve();

async function readFile(): Promise<ProgressFile> {
  try {
    const value = JSON.parse(await fs.readFile(dataFile, "utf8"));
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw error;
  }
}

export async function readSubjectProgress(subject: string) {
  return (await readFile())[subject] ?? null;
}

export async function writeSubjectProgress(
  subject: string,
  progress: StoredSubjectProgress,
) {
  writeQueue = writeQueue.catch(() => undefined).then(async () => {
    const allProgress = await readFile();
    allProgress[subject] = progress;
    await fs.mkdir(dataDirectory, { recursive: true });
    const temporaryFile = `${dataFile}.${process.pid}.tmp`;
    await fs.writeFile(temporaryFile, JSON.stringify(allProgress, null, 2), "utf8");
    await fs.rename(temporaryFile, dataFile);
  });

  await writeQueue;
}
