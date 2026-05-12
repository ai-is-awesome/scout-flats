export const readJson = async <T>(filepath: string): Promise<T | null> => {
  try {
    const fs = await import("fs/promises");
    const data = await fs.readFile(filepath, "utf-8");
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`Error reading or parsing JSON file at ${filepath}:`, error);
    return null;
  }
};
