import fs from "fs";

export const readJson = (path: string) => {
  console.log("Reading JSON from path: ", path);
  const data = fs.readFileSync(path, "utf8");
  return JSON.parse(data);
};
