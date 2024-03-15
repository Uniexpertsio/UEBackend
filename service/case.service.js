const Case = require('../models/Case');

class CaseService {
  async getAllCases() {
    return await Case.find();
  }

  async getCaseById(id) {
    return await Case.findById(id);
  }

  // async createCase(caseData) {
  //   return await Case.create(caseData);
  // }

  async createCase(caseData, res) {
    try {
      let createCase = await new Case(caseData).save();
      if (!createCase) {
        return res.status(404).send({ statuscode: 404, message: 'not created' })
      }
      res.status(201).send({ statuscode: 201, message: "Case created successfully", data: createCase });
    } catch (err) {
      res.status(400).send({ statuscode: 400, message: err.message });
      console.log('create case error', err);
    }
  }

  // async updateCase(id, caseData) {
  //   return await Case.findByIdAndUpdate(id, caseData, { new: true });
  // }

  async updateCase(id, caseData, res) {
    try { 
      let cases = await Case.findOne({_id: id});
      if(!cases) {
          return res.status(404).send({statuscode: 404, message: `No case data with this ${id}`});
      }
      cases = await Case.findOneAndUpdate({ _id: id },{ $set: caseData },{ new: true });
      if(!cases) {
          return res.status(400).send({statuscode: 400, message: 'case data not updated'});
      }
      return res.status(200).send({statuscode: 200, message: 'Case data updated succesfully',data: cases});
  } catch(err) {
      res.status(500).send({statuscode: 500, message: constants.SERVER_ERR});
      console.log('update case error:: ',err);
  }
  }

  async deleteCase(id) {
    return await Case.findByIdAndDelete(id);
  }
}

module.exports = CaseService;
