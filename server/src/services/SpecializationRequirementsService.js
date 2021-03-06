const promisify = require('util').promisify;
const parse = promisify(require('csv-parse'));
const specializationModel = require('../models/Specialization');
const readFile = promisify(require('fs').readFile);

module.exports = {
  async setSpecializationRequirementsFromCsv(filePath, specializationObj) {
    let file = [];
    try {
      file = await readFile(filePath);
    } catch(err) {
      throw new Error("Could not read file: " + err.toString());
    }
    
    const specializationReqs = await this.validateSpecializationRequirements(file);

    let requirements = [];
    if (specializationReqs === false) {
      throw new Error("Invalid CSV");
    } else {
      requirements = specializationReqs.map(record => {
        // map record to req object
        return {
          credits: record["CREDITS"],
          courses: record["COURSES"],
          exceptions: record["EXCEPTIONS"]
        };
      });
    }
    
    try {
      console.log("Creating spec");
      // create specialization  
      const specializationId = await specializationModel.createSpecialization(specializationObj);
      // add requirements to the spec
      console.log("Adding: " + JSON.stringify(specializationObj));
      await this.addSpecializationRequirements(requirements, specializationId);
    } catch (err) {
      throw new Error(err);
    }
  },

  async addSpecializationRequirements(requirements, specId) {
    // possibly need to await this
    requirements.forEach(async req => {
      const parsedRequirement = {
        credits: parseInt(req.credits),
        requirements: this.parseCourses(req.courses),
        exceptions: this.parseCourses(req.exceptions)
      };
      console.log("Adding requirements: " + JSON.stringify(parsedRequirement));
      await specializationModel.createSpecializationRequirement(parsedRequirement, specId);
    });
    
  },

  async validateSpecializationRequirements(file) {
    let records = [];
    try {
      records = await parse(file, { columns: true, trim: true });
    } catch(err) {
      console.error("Failed to parse csv: " + err);
      return false;
    }
    
    return records;
  },

  parseCourses(requirementFromCsv) {
    if (requirementFromCsv === '') {
      return {
        type: "courses",
        courses: []
      };
    }
    let requirements = requirementFromCsv.split(',').map(c => c.trim());
    // Test the first element to see if it is a course
    const testReq = requirements[0].split(' ');
    if (testReq.length > 1 && !isNaN(testReq[1])) {
      const builtRequirement = {
        type: "courses",
        courses: requirements
      };
      return builtRequirement;
    }

    const builtRequirement = {
      type: "category",
      courses: [requirementFromCsv.trim()]
    };
    return builtRequirement;
  }
};