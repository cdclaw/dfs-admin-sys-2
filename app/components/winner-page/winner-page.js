import React from 'react';
import { Container, Row, Col, Tab, Table } from 'react-bootstrap';
var JudgeObj = require('../data/judge');
import fire from '../config/firebase';
require('./winner-page.css');

class WinnerPage extends React.Component{
  constructor(props){
    super(props);
    this.state={winners: []};
  }

  onLogout(e){
    fire.auth().signOut();
  }

  get_school(list){
    var count = 0;
    for (var i in list){
      if (count == 0){
        return list[i];
      }
    }
  }

  get_team(list){
    var count = 0;
    for (var i in list){
      if (count == 1){
        return list[i];
      }
      else{
        count = count + 1;
      }
    }
  }

  get_app(list){
    var count = 0;
    for (var i in list){
      if (count == 2){
        return list[i];
      }
      else{
        count = count + 1;
      }
    }
  }

  get_winner(){
    var winner_list2 = [];
    var winner_dict = {};
    let tt = [];
    for (var i in this.props.teamData2){
      winner_dict[this.props.teamData2[i].teamName]=[this.props.teamData2[i].school, this.props.teamData2[i].appName, this.props.teamData2[i].totalNorScore];
      tt.push(parseFloat(this.props.teamData2[i].totalNorScore));
    }

    tt.sort(function(a,b) { return b-a ; });

    var count = 1;
    for (var i in tt){
      for (var j in winner_dict){
        if (winner_dict[j][2] == tt[i] && count <= 5){
          count = count + 1;
          winner_list2.push([winner_dict[j][0], j, winner_dict[j][1], tt[i]]);
        }
      }
    }
    return winner_list2;
  }

  display_winner() {
    var wl = this.get_winner();

    let image_list = ['../assets/1.png','../assets/2.png','../assets/3.png','../assets/4.png','../assets/5.png']
    count = 0

    if (wl.length >= 5) {
      var temp = (
        <div className="winner-table">
          <Row className="winner-row">
            <Col sm={2} className="winner-img-col"><div className="winner-img-div"><img className="winner-rank" src={require('../assets/1.png')}></img></div></Col>
            <Col sm={3}><p className="winner-text first">{wl[0][0]}<br></br></p><p className="winner-small">School</p></Col>
            <Col sm={3}><p className="winner-text first">{wl[0][1]}<br></br></p><p className="winner-small">Team</p></Col>
            <Col sm={3}><p className="winner-text first">{wl[0][2]}<br></br></p><p className="winner-small">App</p></Col>
            <Col sm={1}><p className="winner-text first">{wl[0][3]}<br></br></p><p className="winner-small">Score</p></Col>
          </Row>
          <Row className="winner-row">
            <Col sm={2} className="winner-img-col"><div className="winner-img-div"><img className="winner-rank" src={require('../assets/2.png')}></img></div></Col>
            <Col sm={3}><p className="winner-text second">{wl[1][0]}<br></br></p><p className="winner-small">School</p></Col>
            <Col sm={3}><p className="winner-text second">{wl[1][1]}<br></br></p><p className="winner-small">Team</p></Col>
            <Col sm={3}><p className="winner-text second">{wl[1][2]}<br></br></p><p className="winner-small">App</p></Col>
            <Col sm={1}><p className="winner-text second">{wl[1][3]}<br></br></p><p className="winner-small">Score</p></Col>
          </Row>
          <Row className="winner-row">
            <Col sm={2} className="winner-img-col"><div className="winner-img-div"><img className="winner-rank" src={require('../assets/3.png')}></img></div></Col>
            <Col sm={3}><p className="winner-text third">{wl[2][0]}<br></br></p><p className="winner-small">School</p></Col>
            <Col sm={3}><p className="winner-text third">{wl[2][1]}<br></br></p><p className="winner-small">Team</p></Col>
            <Col sm={3}><p className="winner-text third">{wl[2][2]}<br></br></p><p className="winner-small">App</p></Col>
            <Col sm={1}><p className="winner-text third">{wl[2][3]}<br></br></p><p className="winner-small">Score</p></Col>
          </Row>
          <Row className="winner-row">
            <Col sm={2} className="winner-img-col"><div className="winner-img-div"><img className="winner-rank rest" src={require('../assets/4.png')}></img></div></Col>
            <Col sm={3}><p className="winner-text rest">{wl[3][0]}<br></br></p><p className="winner-small">School</p></Col>
            <Col sm={3}><p className="winner-text rest">{wl[3][1]}<br></br></p><p className="winner-small">Team</p></Col>
            <Col sm={3}><p className="winner-text rest">{wl[3][2]}<br></br></p><p className="winner-small">App</p></Col>
            <Col sm={1}><p className="winner-text rest">{wl[3][3]}<br></br></p><p className="winner-small">Score</p></Col>
          </Row>
          <Row className="winner-row">
            <Col sm={2} className="winner-img-col"><div className="winner-img-div"><img className="winner-rank rest" src={require('../assets/5.png')}></img></div></Col>
            <Col sm={3}><p className="winner-text rest">{wl[4][0]}<br></br></p><p className="winner-small">School</p></Col>
            <Col sm={3}><p className="winner-text rest">{wl[4][1]}<br></br></p><p className="winner-small">Team</p></Col>
            <Col sm={3}><p className="winner-text rest">{wl[4][2]}<br></br></p><p className="winner-small">App</p></Col>
            <Col sm={1}><p className="winner-text rest">{wl[4][3]}<br></br></p><p className="winner-small">Score</p></Col>
          </Row>
        </div>
      )
      return temp;
    }else{
      
    }
    
  }

  render() {
    return(
      <Container className="panel-content-container"fluid={true}>
        <Row className="panel-row">
          <Col className="panel-col top">
            <h1 className="tab-content-header-h1">Winner !<img className="winner-img" src={require('../assets/winner.png')}></img></h1>
            <button className="logout-btn"><img className="logout-img"onClick={this.onLogout.bind(this)} src={require('../assets/sign-out.png')}></img></button>
          </Col>
        </Row>

        <div className="panel-main-wrapper">
          <Row><Col><p className="winner-header1">AppJamboree</p></Col></Row>
          <Row><Col><p className="winner-header2">{this.props.eventName} Results</p></Col></Row>
          {this.display_winner()}
        </div>
      </Container>
    );
  }
}
export default WinnerPage;