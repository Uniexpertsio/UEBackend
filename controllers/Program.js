const ProgramService = require("../service/program.service");
const { getDataFromSF } = require("../service/salesforce.service");

class ProgramController {
  constructor() {
    this.programService = new ProgramService();
  }

  addPrograms = async (req, res) => {
    try {
      const res = [];
      for (let i = 0; i < req.body.length; i++) {
        const { schoolId } = req.params;
        const programCreateDto = req.body;
        const { id } = req.user;

        const result = await this.programService.createProgram(
          id,
          schoolId,
          programCreateDto
        );
        res.push(result);
      }

      res.status(200).json({ success: true, data: res });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  addOrUpdateProgram = async (req, res) => {
    try {
      // const { schoolId } = req.params;
      const programCreateDto = req.body;
      // const { id } = req.user;

      const result = await this.programService.createOrUpdateProgram(
        programCreateDto
      );

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  getPrograms = async (req, res) => {
    try {
      const { schoolId } = req.params;
      const { page, limit, search } = req.query;
      const programs = await this.programService.getPrograms(
        schoolId,
        page,
        limit,
        search
      );
      res.status(200).json(programs);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  searchProgram = async (req, res) => {
    try {
      const programFilterDto = req.body;
      const programs = await this.programService.searchProgram(
        programFilterDto
      );

      res.status(200).json({ success: true, data: programs });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  getProgram = async (req, res) => {
    try {
      const { programId } = req.params;
      const program = await this.programService.getProgram(programId);

      res.status(200).json({ success: true, data: program });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  getAllProgram = async (req, res) => {
    try {
      const { page, limit, filter, searchType, searchTerm } = req.query;
      const program = await this.programService.getAllProgram(
        page,
        limit,
        filter,
        searchType,
        searchTerm
      );

      res.status(200).json({ success: true, data: program });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  getSimilarProgram = async (req, res) => {
    try {
      const { programId } = req.params;
      const similarPrograms = await this.programService.getSimilarProgram(
        programId
      );

      res.status(200).json({ success: true, data: similarPrograms });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  checkEligibility = async (req, res) => {
    try {
      const { programId } = req.params;
      const { studentId } = req.query;

      const eligibility = await this.programService.isEligibleForProgram(
        programId,
        studentId
      );

      res.status(200).json({ success: true, data: eligibility });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  getProgramByCountryAndDiscipline = async (req, res) => {
    try {
      const countryDisciplineFilter = req.query;
      const program =
        await this.programService.getProgramByCountryAndDiscipline(
          countryDisciplineFilter
        );

      res.status(200).json({ success: true, data: program });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  programFilter = async (req, res) => {
    try {
      const programs = await this.programService.programFilter(req, res);

      res.status(200).json({ success: true, data: programs });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  createEligibility = async (req, res) => {
    try {
      const eligibilityCreateDto = req.body;
      const eligibility = await this.programService.createEligibility(
        eligibilityCreateDto
      );
      res.status(200).json({ success: true, data: eligibility });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
}

module.exports = ProgramController;
