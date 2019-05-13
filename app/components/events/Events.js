import React from 'react';
import fire from '../config/firebase';
require('./events.css');
import { Container, Row, Col, Form, InputGroup } from 'react-bootstrap';
import * as firebase from 'firebase/app';
import PanelFrame from '../menu/panel-frame';
var JudgeObj = require('../data/judge');
var TeamObj = require('../data/team');
var TeamObj2 = require('../data/team2');

class Events extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      eventName: "",
      eventDate: "",
      validated: false,
      events: [],
      chosenEvent: '',
      teamData: null,
      teamData2: null,
      judgeData: null
    }
    this.db = fire.firestore();
  }
  getEventData() {
    fire.firestore().collection('events').where("event", "==", true)
      .get()
      .then(function (querySnapshot) {
        var eventL = [];
        querySnapshot.forEach(function (doc) {
          // doc.data() is never undefined for query doc snapshots
          eventL.push([doc.data().eventName, doc.data().eventDate]);
        });
        return eventL;
      }).then(eventL => {
        this.setState({ events: eventL });
      })
      .catch(function (error) {
        console.log("Error getting documents: ", error);
      });
  }
  // Get existing events from firebase
  onEnterEvent(eventName) {
    this.setState({ chosenEvent: eventName });
    this.getTeamData(eventName);
    this.getJudgeData(eventName);
  }
  // Use the event name passed in to get the team data under that event
  getTeamData(name) {
    var docRef = this.db.collection(name).doc('teams');
    docRef.get().then(function (doc) {
      if (doc.exists) {
        var teamList = [];
        var teamList2 = [];
        for (var x in doc.data()) {
          if (x != "irrelevant") {
            var temp = new TeamObj(doc.data()[x].teamName, doc.data()[x].appName, doc.data()[x].school, doc.data()[x].appDescription, doc.data()[x].scores);
            var temp2 = new TeamObj2(doc.data()[x].teamName, doc.data()[x].appName, doc.data()[x].scores, doc.data()[x].totalNorScore, doc.data()[x].school);
            teamList.push(temp);
            teamList2.push(temp2);
          } else {
          }
        }
        var combine = [teamList, teamList2];
        return (combine);
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    }).then(combine => {
      this.setState({ teamData: combine[0], teamData2: combine[1] });
    })
      .catch(function (error) {
        console.log("Error getting document:", error);
      });
  }

  // Use the event name passed in to get the judge data under that event
  getJudgeData(name) {
    var docRef = this.db.collection(name).doc('judges');
    docRef.get().then(function (doc) {
      if (doc.exists) {
        var judgeLists = [];
        for (var x in doc.data()) {
          if (x != "irrelevant") {
            var temp = new JudgeObj(doc.data()[x].name, doc.data()[x].email, doc.data()[x].password, doc.data()[x].teams);
            judgeLists.push(temp);
          } else {
          }
        }
        return (judgeLists)
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    }).then(judgeLists => {
      this.setState({ judgeData: judgeLists });
    })
      .catch(function (error) {
        console.log("Error getting document:", error);
      });
  }

  componentDidMount() {
    this.getEventData();
  }
  onNameChange(e) {
    this.setState({ eventName: e.target.value });
  }
  onDateChange(e) {
    this.setState({ eventDate: e.target.value });
  }
  // Check if every field is left blank, if not, add the event to firebase
  onEventSubmit(event) {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      // Add the new event in to this.state.event array
      var copyData = this.state.events;
      copyData.push([this.state.eventName, this.state.eventDate]);
      this.setState({ events: copyData });

      // Add the new event to firebase...
      var eventRef = this.db.collection('events').doc(this.state.eventName);
      eventRef.set({
        eventName: this.state.eventName,
        eventDate: this.state.eventDate,
        event: true
      });
      // Initialize the collection
      var eventTeamRef = this.db.collection(this.state.eventName).doc("teams");
      eventTeamRef.set({
        irrelevant: 1
      });
      var eventJudgeRef = this.db.collection(this.state.eventName).doc("judges");
      eventJudgeRef.set({
        irrelevant: 1
      });
    }
    this.setState({ validated: true });
  }
  // Show existing events
  showEvents() {
    var eventCard = [];
    for (let x = 0; x < this.state.events.length; x++) {
      var temp =
        <div className="d-inline-block bg-primary text-white">
          <h3>{this.state.events[x][0]}</h3>
          <p>{this.state.events[x][1]}</p>
          <button onClick={(e) => this.onEnterEvent(this.state.events[x][0])}>enter</button>
          <button onClick={(e) => this.onDeleteEvent(x,this.state.events[x][0])}>delete</button>
        </div>
      eventCard.push(temp);
    }
    return eventCard;
  }

  onDeleteEvent(x, eventName) {
    // Delete event locally from state
    var copyData = this.state.events;
    copyData.splice(x, 1);
    this.setState({ events: copyData });
    // Delete event frome firebase
    this.db.collection("events").doc(eventName).delete().then(function () {
      console.log("Document successfully deleted!");
    }).catch(function (error) {
      console.error("Error removing document: ", error);
    });
    this.db.collection("eventName").doc("teams").delete().then(function () {
      console.log("Document successfully deleted!");
    }).catch(function (error) {
      console.error("Error removing document: ", error);
    });
    this.db.collection("eventName").doc("judges").delete().then(function () {
      console.log("Document successfully deleted!");
    }).catch(function (error) {
      console.error("Error removing document: ", error);
    });

  }
  // Form to add new events
  addEventForm() {
    const { validated } = this.state;
    return (
      <Form
        noValidate
        validated={validated}
      >
        <Form.Row>
          <Form.Group as={Col} md="4" controlId="validationCustom01">
            <Form.Control
              required
              type="text"
              placeholder="Event Name"
              onChange={this.onNameChange.bind(this)}
            />
            <Form.Control.Feedback type="invalid">Please enter an event name.</Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} md="4" controlId="validationCustom01">
            <Form.Control
              required
              type="text"
              placeholder="Event Date"
              onChange={this.onDateChange.bind(this)}
            />
            <Form.Control.Feedback type="invalid">Please enter an event date.</Form.Control.Feedback>
          </Form.Group>
        </Form.Row>
      </Form>
    );
  }

  render() {
    return (

      <Container className="panel-content-container" fluid={true}>
        {!this.state.chosenEvent &&
          <div>
            <Row>
              <Col><p className="events-heading">Choose or Create an Event here</p></Col></Row>
            <Row>
              <Col>Existing Events</Col>
              <Col>Add Events</Col>
            </Row>
            <Row>
              <Col>
                {this.showEvents()}
              </Col>
              <Col>
                {this.addEventForm()}
                <button type="button" onClick={(e) => this.onEventSubmit(e)}>Create</button>
              </Col>
            </Row>
          </div>
        }
        {this.state.chosenEvent && this.state.teamData && this.state.judgeData && this.state.teamData2 && 
          <PanelFrame eventName={this.state.chosenEvent}teamData={this.state.teamData} teamData2={this.state.teamData2}judgeData={this.state.judgeData}></PanelFrame>
        }
      </Container>
    );
  }
}

export default Events;




// import React from 'react';
// import fire from '../config/firebase';
// require('./events.css');
// import { Container, Row, Col, Form, InputGroup, ButtonGroup } from 'react-bootstrap';
// import * as firebase from 'firebase/app';
// import PanelFrame from '../menu/panel-frame';
// import Popup from 'reactjs-popup';
// import { MDBDataTable } from 'mdbreact';
// import DatePicker from 'react-datepicker';
// import { moment } from 'moment';
// // import Modal from '../Modal/Modal';
// import 'react-datepicker/dist/react-datepicker.css';

// var JudgeObj = require('../data/judge');
// var TeamObj = require('../data/team');

// const contentStyle = {
//   maxWidth: "1000px",
//   width: "90%"
// }



// class Events extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       eventName: "",
//       eventDate: "",
//       validated: false,
//       events: [],
//       chosenEvent: '',
//       teamData: [],
//       judgeData: [],
//       showPopup: true, //needed to show the "click here to add an event" button
//       showForm: false, //needed to show the form created when clicking the above button
//       startDate: new Date(),
//       startDateString: '',
//       isShowing: false
//     }

//     // this.state.startDate = null;
//     this.db = fire.firestore();
//     this.openModalHandler = this.openModalHandler.bind(this);
//     this.closeModalHandler = this.closeModalHandler.bind(this);
//     //this.handleDateChange = this.handleDateChange.bind(this);
//   }


//   handleDateChange(date) {
//     var handleDateChangeDebug = true;
//     // date.toString().substring(0, 10);
//     // var dateString = '';
//     var dateString = date.toISOString().substring(0, 10);

//     if (handleDateChangeDebug) {
//       console.log('date:', date);
//       console.log('type of date:', typeof (date));
//       console.log('dateString: ', dateString);
//       console.log('strlen of dateString: ', dateString.length);
//     }
//     // var dateStringSub = dateString.substring(0, 10);
//     // console.log('dateStringSub: ', dateString);


//     //this.setState({ startDate: dateStringSub}); results in a rangeError: invalid time or some shit

//     this.setState({ startDateString: dateString });
//     // this.setState( { startDate: "2019-05-12" } ) ;
//     // this.setState({ startDate: dateString });
//     // this.state.startDate = dateStringSub;
//   }

//   // Use the event name passed in to get the team data under that event
//   getTeamData(name) {
//     var docRef = this.db.collection(name).doc('teams');
//     docRef.get().then(function (doc) {
//       if (doc.exists) {
//         console.log("Team data:", doc.data());
//         var teamList = [];
//         for (var x in doc.data()) {
//           if (x != "irrelevant") {
//             var temp = new TeamObj(doc.data()[x].teamName, doc.data()[x].appName, doc.data()[x].school, doc.data()[x].appDescription, doc.data()[x].scores);
//             teamList.push(temp);
//           } else {
//           }
//         }
//         return (teamList)
//       } else {
//         // doc.data() will be undefined in this case
//         console.log("No such document!");
//       }
//     }).then(teamList => {
//       this.setState({ teamData: teamList });
//     })
//       .catch(function (error) {
//         console.log("Error getting document:", error);
//       });
//   }
//   // Use the event name passed in to get the judge data under that event
//   getJudgeData(name) {
//     var docRef = this.db.collection(name).doc('judges');
//     docRef.get().then(function (doc) {
//       if (doc.exists) {
//         var judgeLists = [];
//         for (var x in doc.data()) {
//           if (x != "irrelevant") {
//             var temp = new JudgeObj(doc.data()[x].name, doc.data()[x].email, doc.data()[x].password, doc.data()[x].teams);
//             judgeLists.push(temp);
//           } else {
//           }
//         }
//         return (judgeLists)
//       } else {
//         // doc.data() will be undefined in this case
//         console.log("No such document!");
//       }
//     }).then(judgeLists => {
//       this.setState({ judgeData: judgeLists });
//     })
//       .catch(function (error) {
//         console.log("Error getting document:", error);
//       });
//   }
//   // Get existing events from firebase
//   getEventData() {
//     fire.firestore().collection('events').where("event", "==", true)
//       .get()
//       .then(function (querySnapshot) {
//         var eventL = [];
//         querySnapshot.forEach(function (doc) {
//           // doc.data() is never undefined for query doc snapshots
//           eventL.push([doc.data().eventName, doc.data().eventDate]);
//         });
//         return eventL;
//       }).then(eventL => {
//         this.setState({ events: eventL });
//       })
//       .catch(function (error) {
//         console.log("Error getting documents: ", error);
//       });
//   }

//   componentDidMount() {
//     this.getEventData();
//   }


//   onNameChange(e) {
//     this.setState({ eventName: e.target.value });
//   }


//   onDateChange(e) {
//     this.setState({ eventDate: e.target.value });
//   }

//   onDateObjectChange(e) {
//     eventDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ssZ"); console.log(p); console.log(typeof (p));
//     this.setState({ startDate: e.target.value });
//   }

//   onAddEvent(e) {
//     var onAddEventDebug = false;
//     if (onAddEvent) {
//       console.log('this.onAddEvent() called');
//     }
//     this.state.showForm = true;
//   }

//   openModalHandler(e) {
//     this.setState({ isShowing: true });
//   }

//   closeModalHandler(e) {
//     this.setState({ isShowing: false });
//   }

//   onEventSubmit(event) {
//     var onEventSubmitDebug = false;
//     if (onEventSubmitDebug) {
//       console.log('onEventSubmit() called');
//     }

//     const form = event.currentTarget;
//     if (form.checkValidity() === false) {
//       event.preventDefault();
//       event.stopPropagation();
//     } else {
//       // Add the new event in to this.state.event array
//       var copyData = this.state.events;
//       copyData.push([this.state.eventName, this.state.startDateString]);
//       this.setState({ events: copyData });

//       // Add the new event to firebase...
//       var eventRef = this.db.collection('events').doc(this.state.eventName);
//       eventRef.set({
//         eventName: this.state.eventName,
//         eventDate: this.state.startDateString,
//         event: true
//       });
//       // Initialize the collection
//       var eventTeamRef = this.db.collection(this.state.eventName).doc("teams");
//       eventTeamRef.set({
//         irrelevant: 1
//       });
//       var eventJudgeRef = this.db.collection(this.state.eventName).doc("judges");
//       eventJudgeRef.set({
//         irrelevant: 1
//       });
//     }
//     this.setState({ validated: true });
//     this.state.showForm = false;

//     if (onEventSubmitDebug) {
//       console.log('showPopup at end of onEventSubmit(): ', this.state.showPopup);
//     }
//   }

//   //using eventDate string
//   // onEventSubmit(event) {
//   //   var onEventSubmitDebug = false;
//   //   if (onEventSubmitDebug) {
//   //      console.log('onEventSubmit() called');
//   //   }

//   //   const form = event.currentTarget;
//   //   if (form.checkValidity() === false) {
//   //     event.preventDefault();
//   //     event.stopPropagation();
//   //   } else {
//   //     // Add the new event in to this.state.event array
//   //     var copyData = this.state.events;
//   //     copyData.push([this.state.eventName, this.state.eventDate]);
//   //     this.setState({ events: copyData });

//   //     // Add the new event to firebase...
//   //     var eventRef = this.db.collection('events').doc(this.state.eventName);
//   //     eventRef.set({
//   //       eventName: this.state.eventName,
//   //       eventDate: this.state.eventDate,
//   //       event: true
//   //     });
//   //     // Initialize the collection
//   //     var eventTeamRef = this.db.collection(this.state.eventName).doc("teams");
//   //     eventTeamRef.set({
//   //       irrelevant: 1
//   //     });
//   //     var eventJudgeRef = this.db.collection(this.state.eventName).doc("judges");
//   //     eventJudgeRef.set({
//   //       irrelevant: 1
//   //     });
//   //   }
//   //   this.setState({ validated: true });
//   //   this.state.showForm = false;

//   //   if (onEventSubmitDebug) {
//   //     console.log('showPopup at end of onEventSubmit(): ', this.state.showPopup);
//   //   }
//   // }

//   showEventsTable() {
//     var eventRows = [];
//     for (let x = 0; x < this.state.events.length; x++) {
//       var index = x + 1;
//       var eventNameColumn = this.state.events[x][0];
//       var eventDateColumn = this.state.events[x][1];

//       var enterButton = <button className="table-btn" type="button" onClick={(e) => this.onEnterEvent(this.state.events[x][0])}>Enter</button>;
//       var deleteButton = <button className="table-btn" type="button" onClick={(e) => this.onDeleteEvent(x, this.state.events[x][0])}>Delete</button>;

//       var temp = {
//         index: index,
//         eventNameColumn: eventNameColumn,
//         eventDateColumn: eventDateColumn,
//         enterButton: enterButton,
//         deleteButton: deleteButton
//       }

//       eventRows.push(temp);
//     }

//     const data = {
//       columns: [
//         {
//           label: '#',
//           field: 'index',
//           sort: 'asc',
//           width: 150
//         },
//         {
//           label: 'Event Name',
//           field: 'eventNameColumn',
//           sort: 'asc',
//           width: 150
//         },
//         {
//           label: 'Event Date',
//           field: 'Event Date Column',
//           sort: 'asc',
//           width: 270
//         },
//         {
//           label: 'Click here to open Event',
//           field: 'enterButton',
//           sort: 'asc',
//           width: 300
//         },
//         {
//           label: 'Click here to delete Event',
//           field: 'deleteButton',
//           sort: 'asc',
//           width: 300
//         }
//       ],
//       rows: eventRows
//     };

//     return (
//       <MDBDataTable
//         striped
//         responsive
//         hover
//         data={data}
//       />);
//   }



//   onEnterEvent(eventName) {
//     this.setState({ chosenEvent: eventName });
//     this.getTeamData(eventName);
//     this.getJudgeData(eventName);
//   }

//   onDeleteEvent(x, eventName) {
//     // Delete event locally from state
//     var copyData = this.state.events;
//     copyData.splice(x, 1);
//     this.setState({ events: copyData });
//     // Delete event frome firebase
//     this.db.collection("events").doc(eventName).delete().then(function () {
//       console.log("Document successfully deleted!");
//     }).catch(function (error) {
//       console.error("Error removing document: ", error);
//     });
//     this.db.collection("eventName").doc("teams").delete().then(function () {
//       console.log("Document successfully deleted!");
//     }).catch(function (error) {
//       console.error("Error removing document: ", error);
//     });
//     this.db.collection("eventName").doc("judges").delete().then(function () {
//       console.log("Document successfully deleted!");
//     }).catch(function (error) {
//       console.error("Error removing document: ", error);
//     });

//   }

//   //addEventForm() attempt 2 - dates as date objects
//   addEventForm(event) {
//     var onAddEventFormDebug = false;
//     const { validated } = this.state;
//     // this.setState({showPopup: true});
//     // this.state.showPopup = true;
//     if (onAddEventFormDebug) {
//       console.log('this.state.showPopup before return in addEventForm(event): ', this.state.showPopup);
//     }

//     if (this.state.showPopup == true /* && this.state.showForm == true*/) {
//       { if (onAddEventFormDebug) { console.log('popup and form shown'); } }
//       return (
//         // <Popup className= "popup-overlay" style={{position: "fixed", top: "0px", bottom: "0px", left: "0px", right: "0px", background: "rgba(0, 0, 0, 0.5)", display: "flex"}}>
//         <div>
//           <Row> </Row>
//           <Row>
//             <Popup className="popup-content" style={{ position: 'absolute', background: 'rgb(255, 255, 255)', width: '90%' /*margin: 'auto'*/, border: '1px solid rgb(187, 187, 187)' }}
//               trigger={<button className="events-modal-button"
//                 on="hover"
//                 onClick={(e) => this.onAddEvent(e)}
//                 style={{ color: "#4156a6", backgroundColor: "#d9dded", padding: 16, margin: 16 }}>
//                 Click here to add an Event
//                                                 </button>}
//               backgroundColor="rgba(0,0,0,0.5)"
//               position="top left"
//               closeOnDocumentClick
//               margin="0"
//               onClick={(e) => this.onAddEvent(e)}
//               contentStyle={{ width: "400px", height: "300px", padding: "3px", border: "none" }}>
//               <Form
//                 noValidate
//                 validated={validated}
//               >
//                 <Form.Row>
//                   <Form.Group as={Row} md="4" controlId="validationCustom01">
//                     <Form.Label>Enter a name for an event.</Form.Label>
//                     <Form.Control
//                       required
//                       type="text"
//                       placeholder="Event Name"
//                       onChange={this.onNameChange.bind(this)}
//                     />
//                     <Form.Control.Feedback type="invalid">Please enter an event name.</Form.Control.Feedback>
//                   </Form.Group>
//                 </Form.Row>
//                 <Row></Row>
//                 <Form.Row>
//                   <Form.Group as={Row} md="4" controlId="validationCustom01">
//                     <Form.Label>Enter a date for this event.</Form.Label>
//                     <DatePicker selected={this.state.startDate} onChange={this.handleDateChange.bind(this)} />
//                     <Form.Control.Feedback type="invalid">Please enter an event date.</Form.Control.Feedback>
//                   </Form.Group>
//                 </Form.Row>

//                 <Row>
//                   <Col></Col>
//                   <Col>
//                     <button className="events-modal-button"
//                       onClick={(e) => this.onEventSubmit(e)}
//                       style={{ backgroundColor: "#d9dded", color: "#4156a6" }}>
//                       Submit Event
//                           </button>
//                   </Col>
//                   <Col></Col>
//                 </Row>

//               </Form>
//             </Popup>
//           </Row>
//           <Row></Row>
//         </div>
//       )
//     }

//     else {
//       { if (onAddEventFormDebug) { console.log('only popup shown'); } }
//       return (

//         <Popup className="popup-content" style={{ position: 'absolute', background: 'rgb(255, 255, 255)', width: '90%', margin: 'auto', border: '1px solid rgb(187, 187, 187)' }}
//           trigger={<button className="events-modal-button"
//             on="hover"
//             onClick={(e) => this.onAddEvent(e)}
//             style={{ color: "#4156a6", backgroundColor: "#d9dded", padding: 16, margin: 16 }}>
//             Click here to add an Event
//                                                 </button>}
//           backgroundColor="rgba(0,0,0,0.5)"
//           position="top left"
//           closeOnDocumentClick
//           onClick={(e) => this.onAddEvent(e)}
//           margin="0"
//           contentStyle={{ width: "300px", height: "300px", padding: "3px", border: "none" }}>
//           {this.onAddEvent()}
//         </Popup>
//       )
//     }
//   }

//   render() {
//     return (
//       <div className="events-container" margin="0" style={{ backgroundColor: '0, 0, 0, 0.5' }}>
//         <header className="events-header">
//           <div className="events-header-container">
//             <div className="events-branding">
//               <Row>
//                 <Col></Col>
//                 <img className="events-logo" src={require('../assets/dfs_programlogo_appjam_stacked.png')} alt="dfs-logo"></img>
//                 <Col></Col>
//               </Row>
//             </div>
//           </div>
//         </header>

//         <Container fluid={true} style={{}}>
//           {!this.state.chosenEvent &&
//             <div className="events-header-container">
//               <Row className="events-firstRow">
//                 <Col></Col>
//                 <Col lg={10}><p className="events-heading">Choose or Create an Event here</p></Col>
//                 <Col></Col>
//               </Row>
//               <Row>
//                 <Col></Col>
//                 <Col>
//                   {/*<button type="button" onClick={(e) => this.addEventForm(e)}>Create</button>*/}
//                   {this.addEventForm()}
//                 </Col>
//                 <Col></Col>
//               </Row>

//               <Row className="events-below-heading" style={{ backgroundColor: "#d9dded", border: "#A0AAD2" }}>
//                 <Col className="table-col">
//                   {this.showEventsTable()}
//                 </Col>
//               </Row>
//             </div>

//           }
//           {this.state.chosenEvent &&
//             <PanelFrame eventName={this.state.chosenEvent} teamData={this.state.teamData} judgeData={this.state.judgeData}></PanelFrame>
//           }
//         </Container>
//       </div>
//     );
//   }
// }

// export default Events;