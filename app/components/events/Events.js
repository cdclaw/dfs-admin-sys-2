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
      teamData: [],
      teamData2: [],
      judgeData: []
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
        {this.state.chosenEvent &&
          <PanelFrame eventName={this.state.chosenEvent}teamData={this.state.teamData} teamData2={this.state.teamData2}judgeData={this.state.judgeData}></PanelFrame>
        }
      </Container>
    );
  }
}

export default Events;