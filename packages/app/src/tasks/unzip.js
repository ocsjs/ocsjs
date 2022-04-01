// 压缩
const AdmZip = require("adm-zip");
const zip = new AdmZip(process.argv[2]);
zip.extractAllTo(process.argv[3], true);
