import React from 'react';
import {
	withRouter
} from 'react-router-dom';
import fire from '../config/firebase';
require ('./judges-page.css');
import {Container, Row, Col, Table, Form, InputGroup} from 'react-bootstrap';
var JudgeObj = require('../data/judge');
import * as firebase from 'firebase/app';
import { MDBDataTable } from 'mdbreact';

class JudgePage extends React.Component{
  constructor(props){
    super(props);
    this.state={name: "",
                email: "",
                password: "",
                rows: [],
                accountValid: null,
                authErrorMsg: null,
                validated: false,
                emailValid: false,
                judgeData: this.props.judgeData,
                addTeamFeedback: ""}
    this.db = fire.firestore();
    this.deleteRow =  this.deleteRow.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  // Generate a 8-digit password
  generatePassword(){
    var length = 8,
      // charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
      charset = "0123456789",
      retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
  }
  deletePscores() {
    
  }
  onLogout(e){
    fire.auth().signOut();
  }
  onNameChange(e){
    this.setState({name: e.target.value});
    this.setState({addTeamFeedback: ""});
  }
  onEmailChange(e){
    this.setState({email: e.target.value});
    const emailValid = this.validateEmail(e.target.value);
    this.setState({emailValid: emailValid});
  }
  // Validate email format
  validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }
  // Upload Judge data to database
  handleSubmit(event){
    const form = event.currentTarget;
    const emailValid = this.validateEmail(this.state.email);
    
    if (form.checkValidity() === false || this.state.name == "" || this.state.email == "" || emailValid === false) {
      event.preventDefault();
      event.stopPropagation();
      console.log("invalid input");
    } else{
      var password = this.generatePassword();
      fire.auth().createUserWithEmailAndPassword(this.state.email, password).then((u)=>{})
      .catch((error)=> {
        console.log(error.code);
        console.log(error.message);
        this.setState({authErrorMsg: error.message});
      });
      //Add judges data into firebase database
      var data = {};
      var judge = {
        name : this.state.name,
        email: this.state.email,
        password: password,
        teams: null
      };
      
      data[judge.name] = judge;
      var judgesRef = this.db.collection(this.props.eventName).doc('judges');
      judgesRef.set(data,{merge: true}).then(function() {
        console.log("Document successfully written!");
      }).then(result=>{
        var dataCopy = [];
        dataCopy = this.props.judgeData;
        var temp = new JudgeObj(this.state.name, this.state.email, password, []);
        dataCopy.push(temp);
        this.setState({judgeData: dataCopy});
        this.setState({addTeamFeedback: "Judge has been added successfully."})    
      }); 
    }
    this.setState({ validated: true });
  }
  showData(){
    let rows = [];
    if ( this.props.judgeData == null){
      this.props.judgeData = [];
    }
    for (let x = 0; x < this.props.judgeData.length; x++){
      var index = x+1;
      var name = this.props.judgeData[x].name;
      var email = this.props.judgeData[x].email;
      var password = this.props.judgeData[x].password;
      var option = <button className="table-btn" type="button" onClick={(e) => this.deleteRow(x)}>Delete</button>;
      var temp = {
        index: index,
        name: name,
        email: email,
        password: password,
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
          label: 'Judge Name',
          field: 'name',
          sort: 'asc',
          width: 150
        },
        {
          label: 'Email',
          field: 'email',
          sort: 'asc',
          width: 270
        },
        {
          label: 'Password',
          field: 'Password',
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
        striped
        responsive
        hover
        data={data}
      />);
  }

  // Delete the selected row from the interface
  deleteRow(x){
    console.log("deleteRow: ", x);
    var judgeName = this.props.judgeData[x].name;
    var copyData = this.props.judgeData;
    copyData.splice(x,1);
    this.setState({judgeData: copyData});
    this.removeJudge(judgeName);
  }
  // Remove the selected judge from firebase
  removeJudge(judgeName){
    console.log("removing judge: ", judgeName);
    var judgeRef = this.db.collection(this.props.eventName).doc('judges');
    let removeJ = judgeRef.update({ 
      [judgeName]: firebase.firestore.FieldValue.delete() 
    });
    return removeJ;
  }

  render(){
    const { validated } = this.state;
    return(
      <Container className="panel-content-container"fluid={true}>
        <Row className="panel-row">
          <Col className="panel-col top">
            <h1 className="tab-content-header-h1">Manage Judges Information and Accounts</h1>
            <button className="logout-btn"><img className="logout-img"onClick={this.onLogout.bind(this)} src={require('../assets/sign-out.png')}></img></button>
          </Col>
        </Row>
        <div className="panel-main-wrapper">
          <Container className="panel-main-container" fluid={true}>
            <Row>
              <Col><p className="header black">Event: {this.props.eventName}</p></Col>
            </Row>
            <Row>
              <Col><p className="header">Genererate Judge Account</p></Col>
            </Row>
            
            <Form className="jp-form"
              noValidate
              validated={validated}
            >
              <Form.Row>
                <Form.Group as={Col} md="4" controlId="validationCustom01">
                  <Form.Control
                    required
                    type="text"
                    placeholder="Judge name"
                    onChange={this.onNameChange.bind(this)}
                  />
                  <Form.Control.Feedback type="invalid">Please enter a judge name.</Form.Control.Feedback> 
         
                </Form.Group>
                <Form.Group as={Col} md="0.5"></Form.Group>

                <Form.Group as={Col} md="4" controlId="validationCustom02">
                  <Form.Control
                    isInvalid={!this.state.emailValid}
                    type="text"
                    placeholder="Judge email"
                    onChange={this.onEmailChange.bind(this)}
                  />
                  <Form.Control.Feedback type="invalid">Please enter a valid judge email.</Form.Control.Feedback>          
                </Form.Group>

                <Form.Group as={Col} md="3" controlId="validationCustom03">
                  <button className="submitform-btn"type="button" onClick={e => this.handleSubmit(e)}>Create</button>
                  <Form.Control.Feedback type="invalid">Please enter a valid judge email.</Form.Control.Feedback>          
                </Form.Group>
                <p className="team-add-feedback judge">{this.state.addTeamFeedback}</p>
              </Form.Row>
            </Form>  

            <Row>
              <Col><p className="header">Account Record</p></Col>
            </Row>
            <Row>
              <Col className="table-col">
                {this.showData()}
              </Col>
            </Row>
          </Container>
        </div>
      </Container>
    )
  }
}

export default JudgePage;
