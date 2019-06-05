import React from 'react';
require('./presentation-page.css');
import fire from '../config/firebase';
import * as firebase from 'firebase/app';
import { Container, Row, Col } from 'react-bootstrap';

class PresentationPage extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      teamScore: [],
      sortedArray: null
    }
    this.db = fire.firestore();

    console.log("presentation score: ", this.props.presentationScore);
    this.renderRawScore = this.renderRawScore.bind(this);
    this.renderRank = this.renderRank.bind(this);
    this.renderPresentationScore = this.renderPresentationScore.bind(this);
    this.rank = this.rank.bind(this);
    this.totalScore = 0;

    this.result = this.rank();
  }
  onLogout(e) {
    fire.auth().signOut();
  }
  renderRawScore(teamName, list) {
    var temp = [];
    for (var x = 0; x < list.length; x++) {
      temp.push(
        <Row>
          <Col lg={4}></Col>
          <Col lg={4}><p>Judge: {list[x][0]}</p></Col>
          <Col lg={4}><p>Score: {list[x][1]}</p></Col>
        </Row>
      );
    }
    return (temp);
  }
  renderPresentationScore(){
    let temp = [];
    for (const [teamName, list] of Object.entries(this.props.presentationScore)) {
      var data =
        <div className="presentation-div">
          <Row>
            <Col lg={4}><p>Team: {teamName}</p></Col>
          </Row>
          {this.renderRawScore(teamName, list)}
        </div> 
      temp.push(data);     
    }
    return temp;
  }
  rank() {
    var totalScoreList = [];
    var meanScoreList = [];
    for (const [teamName, list] of Object.entries(this.props.presentationScore)){
      var totalScore = 0;
      for (var x = 0; x < list.length; x++){
        totalScore += list[x][1];
      }
      var mean = totalScore / list.length;
      totalScoreList.push([teamName, totalScore]);
      meanScoreList.push([ mean.toFixed(3), teamName]);
    }
    var sortedArray = meanScoreList.sort(function (a, b) {
      return b[0] - a[0];
    });
    console.log("mean: ", sortedArray);
    var teamRef = this.db.collection(this.props.eventName).doc("teams");
    for (var y = 0; y < meanScoreList.length; y++) {
      var stringOf = meanScoreList[y][1]+".presentationScores.meanScore";
      teamRef.update({
        [stringOf]: meanScoreList[y][0]
      }).then(function (){
        console.log("presentation mean score successfully updated!");
      });
    }
    
    
    return sortedArray;
  }
  renderRank() {
    var temp = [];
    for (var x = 0; x < this.result.length; x++){
      temp.push(
        <Row className="presentation-row">
          <Col>Rank: {x+1}</Col>
          <Col>Team: {this.result[x][1]}</Col>
          <Col>Score: {this.result[x][0]}</Col>
        </Row>
      )
    }
    return temp;
  }
  render() {
    return (
      <Container className="panel-content-container" fluid={true}>
        <Row className="panel-row">
          <Col className="panel-col top">
            <h1 className="tab-content-header-h1">Presentation Scores</h1>
            <button className="logout-btn"><img className="logout-img" onClick={this.onLogout.bind(this)} src={require('../assets/sign-out.png')}></img></button>
          </Col>
        </Row>

        <div className="panel-main-wrapper">
          <Container className="panel-main-container" fluid={true}>
            <Row>
              <Col><p className="header black">Event: {this.props.eventName}</p></Col>
            </Row>
            <Row>
              <Col><p className="header">Presentation Rank</p></Col>
            </Row>
            {this.renderRank()}
            <Row>
              <Col><p className="header">Scores</p></Col>
            </Row>
            {this.renderPresentationScore()}
          </Container>
        </div>
      </Container>
    )
  }
}
export default PresentationPage;