import React, { Component } from 'react';
import PropTypes from 'prop-types';
import WarningSnackbar from '../WarningSnackbar/WarningSnackbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CourseListSideBar from '../CourseListSideBar/CourseListSideBar';
import Term from '../Term/Term';
import axios from 'axios';
import './PlannerArea.css';

class PlannerArea extends Component {

  state = {
    trashColour: "white",
    terms: [{
      id: 1,
      coursesContained: [],
      year: 2018,
      session: "W",
      number: 1
    }]
  }

  trashDragCounter = 0;

  insertCoursesIntoTerms = () => {
    let terms = [];

    this.props.plan.courses.forEach(course => {
      
      const courseTerms = this.state.terms.concat(this.getTermsForCourse(this.state.terms, course));

      const indexOfTerm = courseTerms.findIndex(existingTerm =>
        course.term === existingTerm.number && course.year === existingTerm.year && course.session === existingTerm.session
      );
      if (indexOfTerm === -1) {
        console.error(`Couldn't find term after creating it. \nTerms: ${JSON.stringify(this.state.terms)}\nCourse: ${JSON.stringify(course)}`);
      }
      courseTerms[indexOfTerm].coursesContained.push(course);
      terms = courseTerms;
    });
    return terms;
  }

  getTermsForCourse(currentTerms, course) {
    let termsToAdd = [];
    const indexOfTerm = currentTerms.findIndex(existingTerm =>  {
      console.log(`Comparing ${JSON.stringify(existingTerm)} with ${JSON.stringify(course)}`);

      return course.term === existingTerm.number && course.year === existingTerm.year && course.term === existingTerm.number;
    });
    if (indexOfTerm !== -1) {
      return [];
    } else {
      let lastTerm = {};
      lastTerm = currentTerms[currentTerms.length - 1];

      while(lastTerm.number != course.term || lastTerm.year != course.year || lastTerm.session != course.session) {

        console.log("Term not found, adding term after term: " + JSON.stringify(lastTerm));
        
        const nextTerm = this.getNextTerm(lastTerm, course);
        termsToAdd.push(nextTerm);
        lastTerm = nextTerm; 

        console.log("Added term: " + JSON.stringify(nextTerm));
        console.log("Terms to add: " + JSON.stringify(termsToAdd));
      }
      return termsToAdd;
    }
  }
    

  getNextTerm(currentTerm) {
    let nextTermNumber;
    let nextTermYear = currentTerm.year;
    let nextTermSession = "W";

    if (currentTerm.number === 1) {
      nextTermNumber = 2;
      nextTermSession = currentTerm.session;
    } else {
      if (currentTerm.session == "W") {
        nextTermYear = currentTerm.year + 1;
        nextTermSession = "S";
      }
      nextTermNumber = 1;
    }
    const nextTermId = currentTerm.id + 1;
    
    const nextTerm = {
      id: nextTermId,
      coursesContained: [],
      year: nextTermYear,
      number: nextTermNumber,
      session: nextTermSession
    };

    return nextTerm;
  }

  updateWarnings() {
    this.getWarnings()
      .then(warnings => {
        this.props.setWarnings(warnings);
      })
      .catch(err => {
        console.error(err);
      });
  }

  objectsAreSame(x, y) {
    var objectsAreSame = true;
    for(var propertyName in x) {
      if(x[propertyName] !== y[propertyName]) {
        objectsAreSame = false;
        break;
      }
    }
    return objectsAreSame;
  }

  componentDidUpdate(prevProps) {
    let same = true;
    
    if (prevProps.plan.courses.length !== this.props.plan.courses.length) {
      this.updateWarnings();
    } else {
      for (let i = 0; i < prevProps.plan.courses.length; i++) {
        if (!this.objectsAreSame(prevProps.plan.courses[i], this.props.plan.courses[i])) {
          same = false;
        }
      }
      if (!same) {
        this.updateWarnings();
      }
    }
  }

  // When we drag a course into the plan, it will have a term associated with it. When its dropped, we can just call map plan to terms
  mapPlanToTerms = () => {
    console.log("Mapping plan to terms...");
    return this.insertCoursesIntoTerms();
  }

  //rendering term components by mapping defaultTerms state variable
  renderTerms = () => {
    let terms = this.insertCoursesIntoTerms();
    terms = terms.map((term) => (
      <Term
        key={term.id}
        term={term}
        coursesContained={term.coursesContained}
        onCourseDragOver={this.onCourseDragOver}
        onCourseDragStart={this.onCourseDragStart.bind(this)}
        onCourseDrop={this.onCourseDrop}
      />
    ));
    return (
      <div id="term-view">
        {terms}
      </div>
    );
  }

  //drag over event handler for term component - passed in as prop
  onCourseDragOver = (e) => {
    e.preventDefault();
  }

  //drag start event handler for course component - passed in as prop via Term
  onCourseDragStart = (e, course, sourceTerm) => {
    console.log(e);
    e.dataTransfer.setData("course", JSON.stringify(course));
    e.dataTransfer.setData("sourceTerm", JSON.stringify(sourceTerm));
  }

  //on drop event handler for term component
  //need to implement removing course from source term
  //need to implement rejection of duplicate courses in a term
  onCourseDrop = (e, targetTerm) => {

    let movedCourse = JSON.parse(e.dataTransfer.getData("course"));

    movedCourse.term = targetTerm.number;
    movedCourse.year = targetTerm.year;
    movedCourse.session = targetTerm.session;

    console.log("Moved Course: " + JSON.stringify(movedCourse));
    let courses = [ ...this.props.plan.courses];
    const updatedCourseIndex = this.props.plan.courses.findIndex(x => x.id === movedCourse.id);

    if (updatedCourseIndex === -1) {
      console.log("Adding course to plan", movedCourse);
      courses.push(movedCourse);
      this.props.updatePlanCourses(courses);
    } else {
      console.log("Moving course already in plan", movedCourse);
      courses.splice(updatedCourseIndex, 1);
      courses = [ ...courses, movedCourse];
      console.log(courses);
      this.props.updatePlanCourses(courses);
    }

  }

  getWarnings = async () => {
    try {
      const response = await axios.post('api/warnings', 
        {
          plan: this.props.plan,
          user: this.props.user
        },
        {
          headers: { "Content-Type": "application/json" }
        }
      );
      return response.data;
      
    } catch(err) {
      console.log(err);
    }
  }

  onCourseDragEnterTrash = (e) => {
    e.preventDefault();
    this.trashDragCounter++;
    console.log("Enter trash");
    this.setState({
      trashColour: "green"
    });
  }

  onCourseDragLeaveTrash = () => {
    this.trashDragCounter--;
    console.log("leave trash", this.trashDragCounter);
    if (this.trashDragCounter === 0) {
      this.setState({
        trashColour: "white"
      });
    }
  }

  onCourseDragOverTrash = (e) => {
    e.preventDefault();
  }

  onCourseDropTrash = (e) => {
    e.preventDefault();
    this.trashDragCounter = 0;
    let movedCourse = JSON.parse(e.dataTransfer.getData("course"));


    console.log("Remove Course: " + JSON.stringify(movedCourse));
    let courses = [ ...this.props.plan.courses];
    const removedCourseIndex = this.props.plan.courses.findIndex(x => x.id === movedCourse.id);

    if (removedCourseIndex === -1) {
      throw new Error("Couldnt find course in plan to remove", JSON.stringify(movedCourse));
    } else {
      console.log("Removing course from plan", movedCourse);
      courses.splice(removedCourseIndex, 1);
      console.log(courses);
      this.props.updatePlanCourses(courses);
      this.setState({
        trashColour: "white"
      });
    }
  }

  componentDidMount() {
    this.updateWarnings();
  }

  render() {
    return (
      <div id="planner-area">
        <div id="session-container">
          <this.renderTerms />
        </div>

        <CourseListSideBar 
          isOpen={this.props.isCourseListOpen} 
          close={this.props.closeCourseList}
          onCourseDragStart={this.onCourseDragStart.bind(this)}
        />

        <WarningSnackbar
          showSnackbar={this.props.showSnackbar}
          closeSnackbar={this.props.closeSnackbar}
          warnings={this.props.warnings}
        />

        <div
          className="floating-icon"
          onDragEnter={this.onCourseDragEnterTrash}
          onDragLeave={this.onCourseDragLeaveTrash}
          onDragOver={this.onCourseDragOverTrash}
          onDrop={this.onCourseDropTrash}
        >
          <FontAwesomeIcon icon="trash" style={{ color: this.state.trashColour }}/>
        </div>

      </div>
    );
  }
}

PlannerArea.propTypes = {
  plan: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  showSnackbar: PropTypes.bool.isRequired,
  closeSnackbar: PropTypes.func.isRequired,
  updatePlanCourses: PropTypes.func.isRequired,
  setWarnings: PropTypes.func.isRequired,
  warnings: PropTypes.array.isRequired,
  closeCourseList: PropTypes.func.isRequired,
  isCourseListOpen: PropTypes.bool.isRequired
};

export default PlannerArea;