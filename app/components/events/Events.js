import React from 'react';
import fire from '../config/firebase';
require('./events.css');
import { Container, Row, Col, Form, InputGroup, ButtonGroup } from 'react-bootstrap';
import * as firebase from 'firebase/app';
import PanelFrame from '../menu/panel-frame';
import Popup from 'reactjs-popup';
import { MDBDataTable } from 'mdbreact';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

var JudgeObj = require('../data/judge');
var TeamObj = require('../data/team');
var TeamObj2 = require('../data/team2');


const contentStyle={
  maxWidth: "1000px",
  width:"90%"
}


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
      judgeData:  null,
      showPopup: true, //needed to show the "click here to add an event" button
      showForm: false, //needed to show the form created when clicking the above button
      startDate: new Date(),
      startDateString: '',
      isShowing: false,
      createRepeatErr: ""
    }

    // this.state.startDate = null;
    this.db = fire.firestore();
    this.openModalHandler = this.openModalHandler.bind(this);
    this.closeModalHandler = this.closeModalHandler.bind(this);
    this.onEventSubmit = this.onEventSubmit.bind(this);
    //this.handleDateChange = this.handleDateChange.bind(this);
  }


  handleDateChange(date){
    var handleDateChangeDebug = false;
    var truncatedDateString = date.toString().substring(4,15);
    if (handleDateChangeDebug) {
      console.log('t date string: ', truncatedDateString);
    }
    this.setState({startDateString: truncatedDateString});
    this.setState({startDate: date});
  }

  // Use the event name passed in to get the team data under that event
  getTeamData(name) {
    var docRef = this.db.collection(name).doc('teams');
    docRef.get().then(function (doc) {
      if (doc.exists) {
        console.log("Team data:", doc.data());
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
        return (combine)
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
  // Get existing events from firebase
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

  componentDidMount() {
    this.getEventData();
  }


  onNameChange(e) {
    for (let x = 0; x < this.state.events.length; x++){
      if (this.state.events[x][0] == e.target.value){
        this.setState({createRepeatErr: "This event is already exist. If you click Create, this event will be overrided."});
        break;
      }else{
        this.setState({createRepeatErr: ""});
      }
    }    
    this.setState({ eventName: e.target.value });
  }

  onDateChange(e) {
    this.setState({ eventDate: e.target.value });
  }

  onAddEvent(e){
    var onAddEventDebug = false;
    if (onAddEvent) {
      console.log('this.onAddEvent() called');
    }
    this.state.showForm = true;
  }

  openModalHandler(e){
    this.setState({ isShowing: true });
  }

  closeModalHandler(e){
    this.setState({ isShowing: false });
  }

  onEventSubmit(event) {
    var onEventSubmitDebug = true;
    if (onEventSubmitDebug) {
       console.log('onEventSubmit() called');
    };

    const form = event.currentTarget;
    if (form.checkValidity() === false || this.state.eventName=="" || this.state.startDateString=="") {
      event.preventDefault();
      event.stopPropagation();
    } else {
      // Add the new event in to this.state.event array
      var copyData = this.state.events;
      copyData.push([this.state.eventName, this.state.startDateString]);
      this.setState({ events: copyData });

      // Add the new event to firebase...
      var eventRef = this.db.collection('events').doc(this.state.eventName);
      eventRef.set({
        eventName: this.state.eventName,
        eventDate: this.state.startDateString,
        event: true
      }).then(function () {
        console.log("Document successfully written!");
      })
        .catch(function (error) {
          console.error("Error writing document: ", error);
        });
      
      // Initialize the collection
      var eventTeamRef = this.db.collection(this.state.eventName).doc("teams");
      eventTeamRef.set({
        irrelevant: 1
      }).then(function () {
        console.log("irrelevant in teams successfully written!");
      })
        .catch(function (error) {
          console.error("Error writing document: ", error);
        });

      var eventJudgeRef = this.db.collection(this.state.eventName).doc("judges");
      eventJudgeRef.set({
        irrelevant: 1
      }).then(function () {
        console.log("irrelevant in judges successfully written!");
      })
        .catch(function (error) {
          console.error("Error writing document: ", error);
        });

    }
    this.setState({ validated: true });
    this.state.showForm = false;

    if (onEventSubmitDebug) {
      console.log('showPopup at end of onEventSubmit(): ', this.state.showPopup);
    };
  }

  showEventsTable(){
    var eventRows = [];
    for(let x = 0; x < this.state.events.length; x++) {
      var index = x + 1;
      var eventNameColumn = this.state.events[x][0];
      var eventDateColumn = this.state.events[x][1];

      var enterButton = <button className="table-btn" type="button" onClick={(e) => this.onEnterEvent(this.state.events[x][0])}>Enter</button>;
      var deleteButton = <button className="table-btn" type="button" onClick={(e) => this.onDeleteEvent(x, this.state.events[x][0])}>Delete</button>;

      var temp = {
        index: index,
        eventNameColumn: eventNameColumn,
        eventDateColumn: eventDateColumn,
        enterButton: enterButton,
        deleteButton: deleteButton
      }

      eventRows.push(temp);
    }

    const data = {
      columns: [
        {
          label: '#',
          field: 'index',
          sort: 'asc',
          width: 150
        },
        {
          label: 'Event Name',
          field: 'eventNameColumn',
          sort: 'asc',
          width: 150
        },
        {
          label: 'Event Date',
          field: 'Event Date Column',
          sort: 'asc',
          width: 270
        },
        {
          label: 'Click here to open Event',
          field: 'enterButton',
          sort: 'asc',
          width: 300
        },
        {
          label: 'Click here to delete Event',
          field: 'deleteButton',
          sort: 'asc',
          width: 300
        }
      ],
      rows: eventRows
    };

    return (
      <MDBDataTable
        striped
        responsive
        hover
        data={data}
      />);
  }

  onEnterEvent(eventName) {
    this.setState({ chosenEvent: eventName });
    this.getTeamData(eventName);
    this.getJudgeData(eventName);
  }

  onDeleteEvent(x, eventName) {
    // Delete event locally from state
    var copyData = this.state.events;
    copyData.splice(x, 1);
    this.setState({ events: copyData });
    // Delete event frome firebase
    this.db.collection("events").doc(eventName).delete().then(function () {
      console.log("event in events collection successfully deleted");
    }).catch(function (error) {
      console.error("Error removing document: ", error);
    });
    this.db.collection(eventName).doc("teams").delete().then(function () {
      console.log("event's teams successfully deleted!");
    }).catch(function (error) {
      console.error("Error removing document: ", error);
    });
    this.db.collection(eventName).doc("judges").delete().then(function () {
      console.log("event's judges successfully deleted!");
    }).catch(function (error) {
      console.error("Error removing document: ", error);
    });

  }

//addEventForm() attempt 2 - dates as date objects
  addEventForm(event) {
    var onAddEventFormDebug = false;
    const { validated } = this.state;
    if(onAddEventFormDebug) { 
      console.log('this.state.showPopup before return in addEventForm(event): ', this.state.showPopup);
    }

    if(this.state.showPopup == true /* && this.state.showForm == true*/) {
      { if(onAddEventFormDebug) { console.log('popup and form shown'); } }
      return (
       <div>
        <Row>
          <Col style={{backgroundColor:"#4156a6"}}></Col>
          <Col xs={10}>
            <div class="text-center">
              <Popup style={{arrow: 'false', position: 'relative', background: 'rgb(255, 255, 255)', width: '90%' /*margin: 'auto'*/, border: '1px solid rgb(187, 187, 187)', zIndex: 999}}
                        trigger={<button className="events-modal-button" 
                                                    on="hover"
                                                    onClick={(e) => this.onAddEvent(e)}
                                                    style={{color: "#4156a6", backgroundColor:"#d9dded", padding:16, margin:16}}> 
                                                    Click here to add an Event 
                                                    </button>}
                        backgroundColor= "rgba(0,0,0,0.5)"
                        position="top left"
                        modal
                        closeOnDocumentClick
                        margin="0"
                        onClick={(e) => this.onAddEvent(e)}
                        contentStyle={{ width: "400px", height: "300px", padding: "3px", border: "none" }}>
                        {/*<div style={{height: '10px',
                                      width: '10px', 
                                      position: 'absolute',
                                       background: 'rgb(255, 255, 255)',
                                        transform: 'rotate(45deg)',
                                        margin: '-5px',
                                        zIndex: '-1',
                                        boxShadow: 'rgba(0, 0, 0, 0.2) 1px 1px 1px',
                                        top: '100%',
                                        left: '122.836px'
                                      }}>
                        </div>*/}
                <Form
                  noValidate
                  validated={validated}
                >
                  <Form.Row>
                    <Form.Group as={Row} md="4" controlId="validationCustom01">
                    <Form.Label style={{padding:'8px', margin:'auto'}}>Enter a name for an event.</Form.Label>
                      <Form.Control
                        required
                        type="text"
                        placeholder="Event Name"
                        className="event-name-input"
                        onChange={this.onNameChange.bind(this)}
                        style={{width:'75%', padding:'16px', margin:'auto'}}
                      />
                      <p className="e-repeat-error">{this.state.createRepeatErr}</p>
                      <Form.Control.Feedback type="invalid">Please enter a non-empty event name.</Form.Control.Feedback>
                    </Form.Group>
                  </Form.Row>
                  <Row></Row>
                  <Form.Row>
                    <Form.Group as={Row} md="4" controlId="validationCustom01">
                    <Form.Label style={{padding:'8px', margin:'auto'}}>Select a date for this event.</Form.Label>
                    <DatePicker
                      className="date-input"
                      selected={this.state.startDate}
                      onChange={this.handleDateChange.bind(this)}
                    />
                    <Form.Control.Feedback type="invalid">Please enter an event date.</Form.Control.Feedback>
                    </Form.Group>
                  </Form.Row>
                  <Form.Row>
                    <Col></Col>
                  </Form.Row>
                  <Form.Row>
                    <Col></Col>
                    <Col>
                        <button className="events-modal-button" 
                              type="button"
                              onClick={(e) => this.onEventSubmit(e)}
                              style={{backgroundColor:"#d9dded", color: "#4156a6", marginTop: '20px'}}
                              >
                              Submit Event
                              </button>
                    </Col>
                    <Col></Col>
                  </Form.Row>

                </Form>
              </Popup>
            </div> {/*text-center div closing tag*/}
          </Col>
          <Col style={{backgroundColor:"#4156a6"}}></Col>
        </Row>
        <Row></Row>
      </div>
      )
    }

    else {
      { if(onAddEventFormDebug) { console.log('only popup shown'); } }
      return(

        <Popup className = "popup-content" style={{position: 'relative', background: 'rgb(255, 255, 255)', width: '90%', margin: 'auto', border: '1px solid rgb(187, 187, 187)'}}
                    trigger={<button className="events-modal-button" 
                                                on="hover"
                                                onClick={(e) => this.onAddEvent(e)}
                                                style={{color: "#4156a6", backgroundColor:"#d9dded", padding:16, margin:16}}> 
                                                Click here to add an Event 
                                                </button>}
                    backgroundColor= "rgba(0,0,0,0.5)"
                    position="top left"
                    closeOnDocumentClick
                    onClick={(e) => this.onAddEvent(e)}
                    margin="0"
                    contentStyle={{ width: "300px", height: "300px", margin: 'auto', padding: "3px", border: "none" }}>
                    {this.onAddEvent()}
                    </Popup>
                    )
    }
  }

  render(){
    return (
      <Container className="panel-content-container" fluid={true}> 

          {!this.state.chosenEvent &&
            <div className="events-header-container">
              {/* <Row>
                <Col></Col>
                  <img className="events-logo" src={require('../assets/dfs_programlogo_appjam_stacked.png')} alt="dfs-logo"></img>
                <Col></Col>
              </Row> */}
              <div className="e-logo-div"><img className="events-logo" src={require('../assets/dfs_programlogo_appjam_stacked.png')} alt="dfs-logo"></img></div>

              {/* <Row className="events-firstRow">
                <Col></Col>
                <Col xs={10}><p className="events-heading">Choose or Create an Event here</p></Col>
                <Col></Col> */}
              <div className="e-header-wrapper">                
                <p className="e-header">Choose or Create an Event here</p>
              </div>
              
              <Row>
                <Col>
                  {this.addEventForm()}
                </Col>
              </Row>

              <Row className="events-below-heading"style={{backgroundColor:"#d9dded", border:"#A0AAD2"}}>
                <Col style={{backgroundColor:"#4156a6"}}></Col>
                <Col className="table-col" xs={10}>
                  {this.showEventsTable()}
                </Col>
                <Col style={{backgroundColor:"#4156a6"}}></Col>
              </Row>
              {/* <div className="event-footer"></div> */}
            </div>

          }
          {this.state.chosenEvent && this.state.teamData && this.state.judgeData && this.state.teamData2 && 
            <PanelFrame eventName={this.state.chosenEvent} teamData={this.state.teamData} teamData2={this.state.teamData2} judgeData={this.state.judgeData}></PanelFrame>
          }
        </Container> 
    );
  }
}

export default Events;