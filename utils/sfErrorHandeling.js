const Mongoose = require("mongoose");

const SFerrorHandler = async (res) => {
    return new Promise((resolve, reject) => {
        if(res.status === 200 || res.status === 201 || res.status === 204 ) {
            return resolve();
        }
        reject({ code : 400, message: "Error while making request to Sales Force api" });
    })
}

 const parseInMongoObjectId = (id) => {
    return new Mongoose.Types.ObjectId(id);
  };

module.exports = {SFerrorHandler,parseInMongoObjectId}
