import React from 'react';
import {
  withRouter
} from 'react-router-dom';
require('./Assign.css');
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
var JudgeObj = require('../data/judge');
import fire from '../config/firebase';
import * as firebase from 'firebase/app';

class AssignPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: [],
      teamName: null,
      appName: null,
      school: null,
      judgeteammap: new Map()
    };
    // console.log("teamdata: ", this.props.teamData);
    // console.log("judgedata: ", this.props.judgeData);
    this.db = fire.firestore();
  }

  onLogout(e) {
    fire.auth().signOut();
  }
  componentDidMount() {
    // window.location.reload();
  }

  displaybyJudge() {
    //TODO: need to prevent users from choosing exiested teams 
    var judgeList = [];
    for (let x = 0; x < this.props.judgeData.length; x++) {
      var temp =
        <Card>
          <Card.Header as="h5">{this.props.judgeData[x].name}</Card.Header>
          <Card.Body>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Team Name</th>
                  <th>App Name</th>
                  <th>School Name</th>
                  <th>Option</th>
                </tr>
              </thead>
              <tbody>
                {this.state.rows.map((r, index) => (
                  <tr key={index + 10000} id={"assign-team" + (this.props.judgeData[x].name).toString() + (index + 10000)}>
                    <td>{r[0]}</td>
                    <td>{r[1]}</td>
                    <td>{r[2]}</td>
                    <td><button type="button" onClick={(e) => this.deleteRow(index + 10000, this.props.judgeData[x].name, "displayJudgesTeams")}>Delete</button></td>
                  </tr>
                ))}
                {this.displayJudgesTeam(x, this.props.judgeData[x].name)}
              </tbody>
            </Table>
            <span className="custom-dropdown">
              <select required onChange={(e) => this.addTeamToJudge(this.props.judgeData[x].name, e)}>
                <option value="" hidden></option>
                {this.props.teamData.map((x, index) => (
                  <option key={x.teamName} value={x.teamName}>{"Team name: " + x.teamName + " School: " + x.school}</option>
                ))}
              </select>
            </span>
          </Card.Body>
        </Card>
      judgeList.push(temp);
    }
    return judgeList;
  }

  displayJudgesTeam(index, judgeName) {
    var teamList = [];
    for (let x = 0; x < this.props.judgeData[index].teams.length; x++) {
      var temp =
        <tr key={x} id={"assign-team" + judgeName.toString() + x}>
          <td>{this.props.judgeData[index].teams[x][0]}</td>
          <td>{this.props.judgeData[index].teams[x][1]}</td>
          <td>{this.props.judgeData[index].teams[x][2]}</td>
          <td><button type="button" onClick={(e) => this.deleteRow(x, judgeName, "displayJudgesTeam")}>Delete</button></td>
        </tr>
      teamList.push(temp);
    }
    return teamList;
  }
  // Delete selected row from table (locally);
  deleteRow(x, name, caller) {
    // If deletRow() is called by displayJudgesTeam(), name is judgeName, anotherName is teamName
    // If deletRow() is called by displayTeamsJudge(), name is teamName, anotherName is judgeName
    console.log("deleteRow: ", x, name);
    var child = document.getElementById("assign-team" + name.toString() + x);
    child.parentNode.removeChild(child);
    var html = child.innerHTML;
    var temp = html.replace(/<td>/g, "");
    var temp2 = temp.replace(/<\/td>/g, "==");
    var list = temp2.split("==");
    var anotherName = list[0];
    if (caller == "displayJudgesTeam") {
      console.log("caller: ", "displayJudgesTeam");
      this.remove(anotherName, name);
    } else {
      console.log("caller: ", "displayTeamsJudge");
      this.remove(name, anotherName);
    }
  }
  // Remove selected row from firebase
  remove(teamName, judgeName) {
    console.log("removing team: ", teamName);
    var judgeRef = this.db.collection(this.props.eventName).doc('judges');
    var stringof = judgeName + ".teams." + teamName;
    let removeT = judgeRef.update({
      [stringof]: firebase.firestore.FieldValue.delete()
    });
    var teamRef = this.db.collection('event-19').doc('teams');
    let stringof2 = teamName + ".scores." + judgeName;
    let removeJ = teamRef.update({
      [stringof2]: firebase.firestore.FieldValue.delete()
    });
    return removeT, removeJ;
  }

  addTeamToJudge(judgeName, e) {
    console.log("selected team: ", judgeName, e.target.value);
    var teamName = e.target.value;
    var judgeRef = this.db.collection(this.props.eventName).doc('judges');
    for (let y = 0; y < this.props.teamData.length; y++) {
      if (this.props.teamData[y].teamName == e.target.value) {
        var appName = this.props.teamData[y].appName;
        var school = this.props.teamData[y].school;
        var appDescription = this.props.teamData[y].appDescription;
      }
    }
    this.setState({ teamName: teamName });
    this.setState({ appName: appName });
    this.setState({ school: school });
    var stringof = judgeName + ".teams." + teamName;
    var temp = {
      teamName: teamName,
      appName: appName,
      school: school,
      appDescription: appDescription
    };
    judgeRef.update({
      [stringof]: temp
    }).then(function () {
      console.log("Document successfully updated!");
    }).then(result => {
      this.displayLocalTeam();
    });
    var teamRef = this.db.collection(this.props.eventName).doc('teams');
    var stringof2 = teamName + ".scores." + judgeName;
    var temp2 = {
      judgeName: judgeName
    }
    teamRef.update({
      [stringof2]: temp2
    }).then(function () {
      console.log("Document successfully updated!");
    });
  }
  displayLocalTeam() {
    var rows = this.state.rows;
    var row = [this.state.teamName, this.state.appName, this.state.school];
    rows.push(row);
    this.setState({ rows: rows });
  }

  displaybyTeam() {
    var teamList = [];
    for (var x in this.props.teamData) {
      var temp =
        <Card>
          <Card.Header as="h5">{this.props.teamData[x].teamName}</Card.Header>
          <Card.Body>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Judge Name</th>
                  <th>Option</th>
                </tr>
              </thead>
              {this.displaybyTeamsJudge(x, this.props.teamData[x].teamName)}
            </Table>
            <span className="custom-dropdown">
              <select required onChange={(e) => this.addJudgeToTeam(this.props.teamData[x].teamName, e)}>
                <option value="" hidden></option>
                {this.props.judgeData.map((x, index) => (
                  <option key={x.name} value={x.name}>{"Judge name: " + x.name}</option>
                ))}
              </select>
            </span>
          </Card.Body>
        </Card>
      teamList.push(temp);
    }
    return teamList;
  }
  displaybyTeamsJudge(index, teamName) {
    var judgeList = [];
    for (let x = 0; x < this.props.teamData[index].scores.length; x++) {
      var temp =
        <tbody>
          <tr id={"assign-team" + teamName.toString() + x}>
            <td>{this.props.teamData[index].scores[x]}</td>
            <td><button type="button" onClick={(e) => this.deleteRow(x, teamName, "displayTeamsJudge")}>Delete</button></td>
          </tr>
        </tbody>
      judgeList.push(temp);
    }
    return judgeList;
  }
  autoAssign() {
    var schoolteamMap = new Map()
    var teamlist = []
    var judgeteamMap = new Map()
    for (var x in this.props.teamData) {
      var teams = []
      schoolteamMap.set(this.props.teamData[x].school, teams)
    }
    for (var x in this.props.teamData) {
      if ([...schoolteamMap.keys()].includes(this.props.teamData[x].school)) {
        var currentteams = schoolteamMap.get(this.props.teamData[x].school)
        currentteams.push(this.props.teamData[x].teamName)
      } else {
        //schoolteamMap.set(this.props.teamData[x].school, teamlist)
      }
    }
    for (var x in this.props.judgeData) {
      var teams = []
      judgeteamMap.set(this.props.judgeData[x].name, teams)
    }
    var numberofjudge = this.props.judgeData.length
    var numberofteam = this.props.teamData.length
    var relation = Math.ceil(numberofteam / numberofjudge)
    console.log(numberofteam)
    console.log(relation)
    var numberofiteration = 0
    var judges = []

    for (var j of judgeteamMap.keys()) {
      judges.push(j)
    }

    var teams = []
    for (var t of schoolteamMap.values()) {
      for (var i in t) {
        teams.push(t[i])
      }
    }
    // console.log(judges)
    // console.log(teams)
    var c = 0
    var n = 0

    while (n < relation) {
      for (var i in teams) {

        var currentteams = judgeteamMap.get(judges[c])
        while (currentteams.includes(teams[i])) {
          if (c < judges.length - 1) {
            c += 1
          } else {
            c = 0
          }
        }
        currentteams.push(teams[i])
        judgeteamMap.set(judges[c], currentteams)
        if (c < judges.length - 1) {
          c += 1
        } else {
          c = 0
        }
      }
      n += 1;
      console.log(judgeteamMap)
    }
    this.setState({ judgeteammap: judgeteamMap }, () => {
      console.log("call back: ", this.state.judgeteammap);
    })
    console.log("after call back:", this.state.judgeteammap)
  }

  render() {
    return (
      <Container className="panel-content-container" fluid={true}>
        <Row className="panel-row">
          <Col className="panel-col top">
            <h1  className="tab-content-header-h1">Assign teams</h1>
            <button className="logout-btn">< img className="logout-img" onClick={this.onLogout.bind(this)} src={require('../assets/sign-out.png')}></img></button>
          </Col>
        </Row>

        <div className="panel-main-wrapper">
          <Container className="panel-main-container" fluid={true}>
            <Row>
              <Col>
                <button className="auto-assign-btn" onClick={this.autoAssign.bind(this)}>Auto Assign</button>
              </Col>
            </Row>
            <Row>
              <Col>
                <Tabs defaultActiveKey="Judges" id="noanim-tab-example">
                  <Tab eventKey="Judges" title="Judges">
                    {this.displaybyJudge()}
                  </Tab>

                  <Tab eventKey="Teams" title="Teams">
                    {this.displaybyTeam()}
                  </Tab>
                </Tabs>

              </Col>
            </Row>
          </Container>

        </div>
      </Container>
    );
  }
}

export default AssignPage;