const SFerrorHandler = async (res) => {
    return new Promise((resolve, reject) => {
        if(res.status === 200 || res.status === 201 || res.status === 204 ) {
            return resolve();
        }
        reject({ code : 400, message: "Error while making request to Sales Force api" });
    })
}

module.exports = SFerrorHandler