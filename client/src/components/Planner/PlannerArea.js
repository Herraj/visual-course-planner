import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PlannerHeader from '../PlannerHeader/PlannerHeader';
import WarningSnackbar from '../WarningSnackbar/WarningSnackbar';
import Semester from '../Semester/Semester';
import './PlannerArea.css';
import {SteppedLineTo} from 'react-lineto';

class PlannerArea extends Component {

  state = {
    warnings: [],
    showSnackbar: false,
    defaultTerms: [
      {
        number: "1",
        coursesContained: ["COSC 111", "COSC 122"],
        targetCourse: ["COSC 121", "COSC 123"],
        year: "2018",
        session: "W"

      },
      {
        number: "2",
        coursesContained: ["COSC 121", "COSC 123"],
        targetCourse: ["COSC 222", "COSC 211"],
        year: "2019",
        session: "W"

      },
      {
        number: "3",
        coursesContained: ["COSC 222", "COSC 211"],
        targetCourse: ["COSC 221", "MATH 200"],
        year: "2019",
        session: "W"

      },
      {
        number: "4",
        coursesContained: ["COSC 221", "MATH 200"],
        targetCourse: ["COSC 304", "COSC 360"],
        year: "2020",
        session: "W"

      },
      {
        number: "5",
        coursesContained: ["COSC 304", "COSC 360"],
        targetCourse: ["COSC 320", "COSC 341"],
        year: "2018",
        session: "W"

      },
      {
        number: "6",
        coursesContained: ["COSC 320", "COSC 341"],
        targetCourse: ["COSC 445", "COSC 328"],
        year: "2018",
        session: "W"

      },
      {
        number: "7",
        coursesContained: ["COSC 445", "COSC 328"],
        targetCourse: ["COSC 421", "COSC 499"],
        year: "2018",
        session: "W"

      },
      {
        number: "8",
        coursesContained: ["COSC 421", "COSC 499"],
        targetCourse: ["", ""],
        year: "2018",
        session: "W"
      }
    ]
  }
  courseRefs = new Map();

  generateCourseRefs = () => {
    this.state.defaultTerms.forEach((term) => {
      term.coursesContained.forEach((course) => {
        let courseRef = React.createRef();
        this.courseRefs.set(course, courseRef);
      });
    });
  }

  courseArrows = [];

  generateCourseArrows = () => {
    this.state.defaultTerms.forEach((term) => {
      for (let i = 0; i < term.coursesContained.length; i++) {
        const sourceCourse = term.coursesContained[i];
        const targetCourse = term.targetCourse[i];

        let sourceXY = this.courseRefs.get(sourceCourse).current.getBoundingClientRect().right;
        let targetXY = this.courseRefs.get(targetCourse).current.getBoundingClientRect().left;
        
        let arrow = <SteppedLineTo fromAnchor = {sourceXY} toAnchor = {targetXY} orientation = "h" />;

        this.courseArrows[i] = arrow;

        
      }
    }

    ); 
  }

  //rendering semester components by mapping defaulTerms state variable
  renderSemesters = () => {
    return (this.state.defaultTerms.map((term) =>
      <Semester
        key={term.number}
        term={term.number}
        coursesContained={term.coursesContained}
        onCourseDragOver={this.onCourseDragOver}
        onCourseDragStart={this.onCourseDragStart.bind(this)}
        onCourseDrop={this.onCourseDrop}
        courseRefMap={this.courseRefs}
        showXY={this.showElementCoordinates.bind(this)} />
    ));
  }

  //drag over event handler for semester component - passed in as prop
  onCourseDragOver = (e) => {
    e.preventDefault();
  }

  //drag start event handler for course component - passed in as prop via Semester
  onCourseDragStart = (e, courseCode, sourceTerm) => {
    e.dataTransfer.setData("courseCode", courseCode);
    e.dataTransfer.setData("sourceTerm", sourceTerm);
  }

  //on drop event handler for semester component
  //need to implement removing course from source term
  //need to implement rejection of duplicate courses in a term
  onCourseDrop = (e, targetTerm) => {

    let movedCourse = e.dataTransfer.getData("courseCode");
    let sourceTerm = e.dataTransfer.getData("sourceTerm");
    const targetTermIndex = targetTerm - 1;
    const sourceTermIndex = sourceTerm - 1;
    let removedCourseIndex;
    console.log("source term: " + sourceTerm);
    console.log("target term: " + targetTerm);

    //extract source term object from the state variable
    const sourceTermObject = this.state.defaultTerms.filter((term) => {
      if ((targetTerm != sourceTerm) && (term.number == sourceTerm)) {
        console.log("filtered term: " + term.number);
        return term;
      }
    });
    console.log(sourceTermObject);

    //check if source term object extracted from state is not empty
    if(sourceTermObject.length != 0) {
     
      removedCourseIndex = sourceTermObject[0].coursesContained.indexOf(movedCourse);
      console.log("lulu");
      
      //remove course by updating state
      this.setState({
        defaultTerms: [
          ...this.state.defaultTerms.slice(0, sourceTermIndex),
          Object.assign([], this.state.defaultTerms[sourceTermIndex], sourceTermObject[0].coursesContained.splice(removedCourseIndex,1)),
          ...this.state.defaultTerms.slice(sourceTermIndex + 1)
        ]
      });
    }
    else
      removedCourseIndex = -1;
    
    //add course
    this.state.defaultTerms.filter((term) => {
      if ((targetTerm != sourceTerm) && (term.number == targetTerm)) {

        this.setState({
          defaultTerms: [
            ...this.state.defaultTerms.slice(0, targetTermIndex),
            Object.assign([], this.state.defaultTerms[targetTermIndex], term.coursesContained.push(movedCourse)),
            ...this.state.defaultTerms.slice(targetTermIndex + 1)
          ]
        });
      }
    });

    console.log(this.state);
  }

  showSnackbar = () => {
    this.setState({ showSnackbar: true });
  }

  closeSnackbar = () => {
    this.setState({ showSnackbar: false });
  }

  setWarnings = (warnings) => {
    this.setState({
      warnings: warnings
    });
  }

  showElementCoordinates = (e, courseRef) => {
    let element = courseRef.current.getBoundingClientRect().left;
    alert(element);
  }

  render() {
    this.generateCourseRefs();
    return (
      <div id="planner-area">
        <PlannerHeader
          plan={this.props.plan}
          toggleSidebar={this.props.toggleSidebar}
          optimize={this.props.optimize}
          showWarning={this.showSnackbar}
          setWarnings={this.setWarnings}
          warnings={this.state.warnings}
          user={this.props.user}
        />

        <div id="semester-view">
          <this.renderSemesters />
        </div>

        <WarningSnackbar
          showSnackbar={this.state.showSnackbar}
          closeSnackbar={this.closeSnackbar}
          warnings={this.state.warnings}
        />
        <div id="session-container">

        </div>
        {console.log(this.courseArrows)}
      </div>
    );
  }
}

PlannerArea.propTypes = {
  plan: PropTypes.object.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
  optimize: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired
};

export default PlannerArea;