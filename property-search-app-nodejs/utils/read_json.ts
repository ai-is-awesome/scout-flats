import fs from "fs";

const readJson = (path: string) => {
    const data = fs.readFileSync(path, "utf8");
    return JSON.parse(data);
};

export default readJson;


