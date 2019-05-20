import React from 'react';
require('./team-page.css');
import {Container, Row, Col, Form, InputGroup} from 'react-bootstrap';
import fire from '../config/firebase';
var TeamObj = require('../data/team');
import * as firebase from 'firebase/app';
import { MDBDataTable } from 'mdbreact';

class TeamPage extends React.Component{
  constructor(props){
    super(props);
    this.state = {teamName: "",
                  appName: "",
                  school: "",
                  appDescription: "",
                  rows: [],
                  validated: false,
                  teamData: this.props.teamData,
                  addTeamFeedback: ""};
    this.db = fire.firestore();
    this.deleteRow =  this.deleteRow.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  onLogout(e){
    fire.auth().signOut();
  }
  onTeamNameChange(e){
    this.setState({teamName: e.target.value});
    this.setState({addTeamFeedback: ""});
  }
  onAppNameChange(e){
    this.setState({appName: e.target.value});
  }
  onSchoolChange(e){
    this.setState({school: e.target.value});
  }
  onAppDesChange(e){
    this.setState({appDescription: e.target.value});
  }
  // Add team to firebase
  handleSubmit(event) {
    const form = event.currentTarget;
    if (form.checkValidity() === false || this.state.teamName == "" || this.state.appName == "" || this.state.school == "" || this.state.appDescription == "") {
      event.preventDefault();
      event.stopPropagation();
      console.log("invalid input");
    } else{
      console.log("valid input");
      var data = {};
      var team = {
        teamName: this.state.teamName,
        appName: this.state.appName,
        school: this.state.school,
        appDescription: this.state.appDescription,
        scores: null,
        totalNorScore: 0,
        totalRawScore: 0
      };
      data[team.teamName] = team;
      var teamRef = this.db.collection(this.props.eventName).doc('teams');
      teamRef.set(data, {merge: true}).then(function() {
        console.log("Add team successful!");
      }).then(result=>{
        var dataCopy=[];
        dataCopy = this.props.teamData;
        var temp = new TeamObj(this.state.teamName, this.state.appName, this.state.school ,this.state.appDescription, []);
        dataCopy.push(temp);
        this.setState({teamData: dataCopy});
        this.setState({addTeamFeedback: "Team has been added successfully."})    
      });
    }
    this.setState({ validated: true });
  }

  // Delete the selected row from the interface
  deleteRow(x) {
    var teamName = this.props.teamData[x].teamName;
    var copyData = this.props.teamData;
    copyData.splice(x,1);
    this.setState({teamData: copyData});
    this.removeTeam(teamName);  
    console.log("after: ", this.props.teamData);
  }
  // Remove the selected team from firebase
  removeTeam(teamName){
    console.log("removing team: ", teamName);
    var teamRef = this.db.collection(this.props.eventName).doc('teams');
    let removeT = teamRef.update({ 
      [teamName]: firebase.firestore.FieldValue.delete() 
    });
    return removeT;
  }
  // Show table
  showData() {
    if (this.props.teamData == null) {
      this.props.teamData = [];
    }
    let rows = [];
    for (let x=0; x<this.props.teamData.length; x++){
      var index = x+1;
      var teamName = this.props.teamData[x].teamName;
      var appName = this.props.teamData[x].appName;
      var school = this.props.teamData[x].school;
      var option = <button className="table-btn" type="button" onClick={(e) => this.deleteRow(x)}>Delete</button>;
      var temp = {
        index: index,
        teamName: teamName,
        appName: appName,
        school: school,
        option: option
      }
      rows.push(temp);
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
          label: 'Team Name',
          field: 'teamName',
          sort: 'asc',
          width: 150
        },
        {
          label: 'App Name',
          field: 'appName',
          sort: 'asc',
          width: 270
        },
        {
          label: 'School',
          field: 'school',
          sort: 'asc',
          width: 200
        },
        {
          label: 'Option',
          field: 'option',
          sort: 'asc',
          width: 100
        }
      ],
      rows: rows
    };
    return (
      <MDBDataTable
        bordered
        responsive
        hover
        data={data}
      />);
  }
  render(){
    const { validated } = this.state;
    return (

      <Container className="panel-content-container" fluid={true}>
        <Row className="panel-row">
          <Col className="panel-col top">
            <h1 className="tab-content-header-h1">Manage Teams Information</h1>
            <button className="logout-btn"><img className="logout-img"onClick={this.onLogout.bind(this)} src={require('../assets/sign-out.png')}></img></button>
          </Col>
        </Row>

        <div className="panel-main-wrapper">
          <Container className="panel-main-container" fluid={true}>
            <Row>
              <Col><p className="header black">Event: {this.props.eventName}</p></Col>
            </Row>
            <Row>
              <Col lg={7}><p className="header">Team Record</p></Col>
              <Col lg={5}><p className="header tp">Add Team</p></Col>
            </Row>
            <Row>
              <Col lg={7} className="tp-table-col">
                {this.showData()}
              </Col>
              <Col lg={5} className="tp-form-col">
                <Form
                noValidate
                validated={validated}
                className="tp-form"
                >
                  <Form.Row>
                    <Form.Group as={Col} md="12" controlId="validationCustom01">
                      <Form.Label>Team name</Form.Label>
                      <Form.Control
                        required
                        type="text"
                        placeholder="Team name"
                        onChange={this.onTeamNameChange.bind(this)}
                      />
                      <Form.Control.Feedback type="invalid">Please enter a team name.</Form.Control.Feedback>          
                    </Form.Group>

                    <Form.Group as={Col} md="12" controlId="validationCustom02">
                      <Form.Label>App name</Form.Label>
                      <Form.Control
                        required
                        type="text"
                        placeholder="App name"
                        onChange={this.onAppNameChange.bind(this)}
                      />
                      <Form.Control.Feedback type="invalid">Please enter an app name.</Form.Control.Feedback>          
                    </Form.Group>

                    <Form.Group as={Col} md="12" controlId="validationCustom02">
                      <Form.Label>School</Form.Label>
                      <Form.Control
                        required
                        type="text"
                        placeholder="School"
                        onChange={this.onSchoolChange.bind(this)}
                      />
                      <Form.Control.Feedback type="invalid">Please enter a school.</Form.Control.Feedback>          
                    </Form.Group>
                  </Form.Row>

                  <Form.Row>
                    <Form.Group as={Col} md="12" controlId="exampleForm.ControlTextarea1">
                      <Form.Label>Project Description</Form.Label>
                      <Form.Control required as="textarea" rows="3" placeholder="Project description" onChange={this.onAppDesChange.bind(this)}/>
                      <Form.Control.Feedback type="invalid">
                        Please enter an app description.
                      </Form.Control.Feedback> 
                    </Form.Group>
                  </Form.Row>
                </Form>
                <Row>
                  <Col lg={7}><p className="team-add-feedback">{this.state.addTeamFeedback}</p></Col>
                  <Col lg={5}><button className="submitform-btn team" type="button" onClick={e => this.handleSubmit(e)}>Create</button></Col>
                </Row>
              </Col>
            </Row>
          </Container>
        </div>
      </Container> 
    )
  }
}
export default TeamPage;