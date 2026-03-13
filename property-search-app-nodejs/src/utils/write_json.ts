import fs from "fs";


function writeJson(path: string, data: any) {
    console.log("Writing JSON to path: ", path)
    fs.writeFileSync(path, JSON.stringify(data, null, 2), "utf8");
}


export default writeJson;