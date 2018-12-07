const warningService = require('../../src/services/WarningService');
const assert = require('chai').assert;

describe("WarningService", () => {
  
  describe("#getWarningsForCourse()", () => {
    
    it("should a return standing warning when one exists", () => {
      let user = {
        name: "Test",
        standing: 2
      };

      let course = {
        code: "COSC 341",
        standingRequirement: 3,
        coRequisites: [],
        preRequisites: []
      };

      const expectedWarnings = [
        {
          message: "COSC 341 requires year 3. Current standing: 2.",
          type: "standing"
        }
      ];

      const actualWarnings = warningService.getWarningsForCourse(null, user, course);

      assert.deepEqual(actualWarnings, expectedWarnings);

    });

    it("should a return coreq missing warning when one exists", () => {
      let user = {
        name: "Test",
        standing: 3
      };

      let course = {
        code: "COSC 304",
        standingRequirement: 3,
        coRequisites: [{
          code: "COSC 360"
        }],
        preRequisites: [],
        year: "2018",
        semester: "1"
      };

      let plan = {
        courses: [course]
      };

      const expectedWarnings = [
        {
          message: "COSC 304 missing co-requisite COSC 360.",
          type: "coreq"
        }
      ];

      const actualWarnings = warningService.getWarningsForCourse(plan, user, course);

      assert.deepEqual(actualWarnings, expectedWarnings);
    });
    it("should a return coreq wrong semester warning when one exists", () => {
      let user = {
        name: "Test",
        standing: 3
      };

      let course = {
        code: "COSC 304",
        standingRequirement: 3,
        coRequisites: [{
          code: "COSC 360"
        }],
        preRequisites: [],
        year: "2018",
        semester: "1"
      };

      let plan = {
        courses: [course]
      };

      const expectedWarnings = [
        {
          message: "COSC 304 missing co-requisite COSC 360.",
          type: "coreq"
        }
      ];

      const actualWarnings = warningService.getWarningsForCourse(plan, user, course);

      assert.deepEqual(actualWarnings, expectedWarnings);
    });
  });

  describe("#getWarnings()", () => {
    it("empty plan should return no warnings", () => {
      let plan = {
        courses: []
      };

      let user = {
        name: "Test",
        standing: "1"
      };
      const expectedWarnings = [];
      const acutalWarnings = warningService.getWarnings(plan, user);
      assert.deepEqual(acutalWarnings, expectedWarnings);
      
    });
  });
});