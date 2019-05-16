import React from 'react';
import { Container, Row, Col, Card, Tab, Table, Tabs } from 'react-bootstrap';
var JudgeObj = require('../data/judge');
import fire from '../config/firebase';

class TotalPage extends React.Component{
  constructor(props){
    super(props);
    this.state = {
        teamName: "",
        judgeName: "",
        dscore1: 0,
        dscore2: 0,
        fscore1: 0,
        fscore2: 0,
        tscore1: 0,
        tscore2: 0,
        pscore1: 0,
        totalScore: 0
    }
    this.displaybyTeamsJudge = this.displaybyTeamsJudge.bind(this);
    console.log("total: ", this.props.teamData2);
  }

  onLogout(e){
    fire.auth().signOut();
  }

  displaybyTeam(){
    var teamList = []
    for (var x in this.props.teamData){
      var name = this.props.teamData[x].teamName;
      var temp = 
        <Card>
          <Card.Header as="h5">{this.props.teamData[x].teamName + "‘s Total Socre"}</Card.Header>
          <Card.Body>
            <Card.Text>
            <Table borderd hover responsive>
              <thead>
                <tr>
                  <th>Judge Name</th>
                  <th>Design 1</th>
                  <th>Design 2</th>
                  <th>Functionality 1</th>
                  <th>Functionality 2</th>
                  <th>Theme 1</th>
                  <th>Theme 2</th>
                  <th>Presentation</th>
                  <th>Total</th>
                </tr>
              </thead>
              {this.displaybyTeamsJudge(name)}                
            </Table>
            </Card.Text>
          </Card.Body>
        </Card>
      teamList.push(temp);
    }
    return teamList;
  }

  displaybyTeamsJudge(name){
    var teamList = [];
    for ( var i in this.props.teamData2){
      if (this.props.teamData2[i].teamName == name && this.props.teamData2[i].scores != {}){
        let totalscore = 0;
        for (var j in this.props.teamData2[i].scores){
          totalscore = totalscore + this.props.teamData2[i].scores[j].totalScore
          var temp = 
            <tbody>
              <tr>
                <td>{j}</td>
                <td>{this.props.teamData2[i].scores[j].dscore1}</td>
                <td>{this.props.teamData2[i].scores[j].dscore2}</td>
                <td>{this.props.teamData2[i].scores[j].fscore1}</td>
                <td>{this.props.teamData2[i].scores[j].fscore2}</td>
                <td>{this.props.teamData2[i].scores[j].tscore1}</td>
                <td>{this.props.teamData2[i].scores[j].tscore2}</td>
                <td>{this.props.teamData2[i].scores[j].pscore1}</td>
                <td>{this.props.teamData2[i].scores[j].totalScore}</td>
              </tr>
            </tbody>
          teamList.push(temp);
        } 
        var temp = 
          <Table>
            <thead>
              <tr>
                <th>Total Score is : {this.props.teamData2[i].totalNorScore}</th>
              </tr>
            </thead>
          </Table>
        teamList.push(temp);
        break;
      }else{
      }
    }
    return teamList;
  }

  create_table(){
    var i = 
      <table id="table-to-xls">
        <tr>
          <th>Firstname</th>
          <th>Lastname</th>
          <th>Age</th>
        </tr>
        <tr>
          <td>Jill</td>
          <td>Smith</td>
          <td>50</td>
        </tr>
        <tr>
          <td>Eve</td>
          <td>Jackson</td>
          <td>94</td>
        </tr>
      </table>
    return "table-to-xls";
  }

  render(){
    return(
      <Container className="panel-content-container"fluid={true}>
        <Row className="panel-row">
          <Col className="panel-col top">
            <h1 id="nihao" className="tab-content-header-h1">Total Calculation</h1>
            <button className="logout-btn"><img className="logout-img"onClick={this.onLogout.bind(this)} src={require('../assets/sign-out.png')}></img></button>
          </Col>
        </Row>
        <div className="panel-main-wrapper">
          <Container className="panel-main-container" fluid={true}>
            <Row>
              <Col><p className="header">Display Total Scores</p></Col>
            </Row>
            <Row>
              <Col>        
                {this.displaybyTeam()}       
              </Col> 
            </Row>
          </Container>
        </div>
      </Container>
    );
  }
}

export default TotalPage;