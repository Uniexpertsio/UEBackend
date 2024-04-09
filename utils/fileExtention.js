// const getFileExtension = fileName => {
//     // Split the file name by dot (.)
const path = require('path');

const getFileExtension = fileName => {
    const extension = path.extname(fileName);
    return extension.toLowerCase();
};

module.exports = { getFileExtension };