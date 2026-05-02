export const saveContent = (content: string, filename: string): void => {
  const fs = require("fs");
  fs.writeFileSync(filename, content, "utf-8");
};
