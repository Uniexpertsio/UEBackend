// const getFileExtension = fileName => {
//     // Split the file name by dot (.)
const path = require("path");
const { JSDOM } = require("jsdom");

const getFileExtension = (fileName) => {
  const extension = path.extname(fileName);
  return extension.toLowerCase();
};

const urlReplacer = (data) => {
  const processedData = data?.records?.map((item) => {
    if (item?.Term_Condition__c) {
      const dom = new JSDOM(item?.Term_Condition__c);
      var imgElement = dom.window.document.querySelector("img");
      var srcValue = imgElement.getAttribute("src");
      let logo = srcValue.replace(
        process.env.SF_API_URL,
        process.env.SF_REPLACE_URL
      );
      logo = logo.replace("amp;", "");
      return { url: logo };
    }
  });
  return processedData;
};

module.exports = { getFileExtension, urlReplacer };
