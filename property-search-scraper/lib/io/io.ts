interface FileHandler<T> {
  readJson(filePath: string): Promise<T | null>;
}

export class JsonFileHandler {
  constructor(filePath: string) {}

  static async readJson<T>(filePath: string): Promise<T | null> {
    try {
      const fs = await import("fs/promises");
      const data = await fs.readFile(filePath, "utf-8");
      return JSON.parse(data) as T;
    } catch (e) {
      console.error(`Error reading JSON file at ${filePath}:`, e);
      return null;
    }
  }

  static async writeJson<T>(filePath: string, data: T): Promise<void> {
    try {
      const fs = await import("fs/promises");
      const jsonData = JSON.stringify(data, null, 2);
      await fs.writeFile(filePath, jsonData, "utf-8");
    } catch (e) {
      console.error(`Error writing JSON file at ${filePath}:`, e);
    }
  }
}
