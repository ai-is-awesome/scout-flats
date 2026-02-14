import fs from "fs";


function writeJson(path: string, data: any) {
    fs.writeFileSync(path, JSON.stringify(data, null, 2), "utf8");
}


export default writeJson;