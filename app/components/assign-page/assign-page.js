import React from 'react';
require('./Assign.css');
import {Container, Row, Col, Card, Table, Tabs, Tab} from 'react-bootstrap';
import fire from '../config/firebase';
import * as firebase from 'firebase/app';

class AssignPage extends React.Component{
  constructor(props){
    super(props);
    this.state = {rows: [],
                  teamName: null,
                  appName: null,
                  school: null,
                  judgeteammap: new Map(),
                  schoolteammap: new Map(),
                  teamjudgemap: new Map(),
                  deleteteams: [],
                  deletejudges: [],
                  deletejudgeteams : {},
                  deleteteamsjudge : {},
                  addteamsjudge:{},
                  addjudgesteam:{},
                  added:false
                };
    this.db = fire.firestore();
  }

  onLogout(e){
    fire.auth().signOut();
  }
  componentDidMount(){
    // window.location.reload();
    var judgeteamMap = new Map()
    for (var x in this.props.judgeData){
      var teams = [] 
      for (let i = 0; i < this.props.judgeData[x].teams.length; i++){
        teams.push(this.props.judgeData[x].teams[i][0])
      }
      judgeteamMap.set(this.props.judgeData[x].name, teams)
    }
    this.setState({judgeteammap: judgeteamMap})
    var teamjudgeMap = new Map()
    for (var x in this.props.teamData){
      var judges = [] 
      for (let i = 0; i < this.props.teamData[x].scores.length; i++){
        judges.push(this.props.teamData[x].scores[i])
      }
      teamjudgeMap.set(this.props.teamData[x].teamName, judges)
    }
    this.setState({teamjudgemap: teamjudgeMap})
  }

  displaybyJudge(){
    //TODO: need to prevent users from choosing exiested teams 
    
    var judgeList = [];
    
    for (var [k,v] of this.state.judgeteammap.entries()){
        var temp = 
          <Card>
            <Card.Title><div className="assign-card-title">{k}</div></Card.Title>
            <Card.Body> 
              <Table bordered hover responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Team Name</th>
                    <th>School Name</th>
                    <th>Option</th>
                  </tr>
                </thead>
                <tbody>
                  {this.displayJudgesTeam(k,v)}
                </tbody>
              </Table>
              <span className="custom-dropdown">
                <select required onChange={(e) => this.recordAddJudge(e)}>
                  <option value="" hidden></option>
                  {this.props.teamData.map((x, index)=>(
                    <option key={x.teamName} value={k+"-"+x.teamName}>{"Team:" + x.teamName}</option>
                  ))}
                </select>
              </span>
            </Card.Body>
          </Card>
        judgeList.push(temp);
      }
    return judgeList;
  }

  displayJudgesTeam(jn,teaml){
    var teamList = [];
    for (let x = 0; x < teaml.length; x++){
      var temp = 
            <tr key={x} id={"assign-team-judgeside"+jn+teaml[x]}>
              <td>{x+1}</td>
              <td>{teaml[x]}</td>
              <td>{this.dispalyJudgesTeam_helper(teaml[x])}</td>
              <td><button className="table-btn assign"type="button"onClick={(e)=>this.deleteRow(teaml[x],jn,teaml[x],"displayJudgesTeam")}>Delete</button></td>
            </tr>   
      teamList.push(temp);
    }
    return teamList;
  }

  dispalyJudgesTeam_helper(teamname){
    for (var [k,v] of this.state.schoolteammap.entries()){
      if(v.includes(teamname)){
        return k
      }
    }
  }
  // Delete selected row from table (locally);
  deleteRow(x,mastername,name,caller){
    // If deletRow() is called by displayJudgesTeam(), name is judgeName, anotherName is teamName
    // If deletRow() is called by displayTeamsJudge(), name is teamName, anotherName is judgeName    
    if (caller == "displayJudgesTeam"){
      if (this.state.deletejudgeteams[mastername] == null){
        this.state.deletejudgeteams[mastername] = []
        this.state.deletejudgeteams[mastername].push(name)
      }else{
        this.state.deletejudgeteams[mastername].push(name)
      }
      if (this.state.deleteteamsjudge[name] == null ){
        this.state.deleteteamsjudge[name] = []
        this.state.deleteteamsjudge[name].push(mastername)
      }else{
        this.state.deleteteamsjudge[name].push(mastername)
      }
      var child1 = document.getElementById("assign-team-judgeside"+mastername + x);
      child1.parentNode.removeChild(child1);
      var child2 = document.getElementById("assign-team-teamside"+ x+ mastername);
      child2.parentNode.removeChild(child2);
      
    }else{
      console.log("deleterow", mastername,name)
      if (this.state.deleteteamsjudge[mastername] == null ){
        this.state.deleteteamsjudge[mastername] = []
        this.state.deleteteamsjudge[mastername].push(name)
      }else{
        this.state.deleteteamsjudge[mastername].push(name)
      }
      if (this.state.deletejudgeteams[name] == null){
        this.state.deletejudgeteams[name] = []
        this.state.deletejudgeteams[name].push(mastername)
      }else{
        this.state.deletejudgeteams[name].push(mastername)
      }
      
      var child3 = document.getElementById("assign-team-teamside" +mastername+x);
      child3.parentNode.removeChild(child3);
      var child4 = document.getElementById("assign-team-judgeside"+ x+mastername);
      child4.parentNode.removeChild(child4);      
    }
  }
  // Remove selected row from judgeteammap
  remove(name,callername){
    console.log("removing team: ", name);
    if (callername == "displayJudgesTeam"){
      for (var [k,v] of this.state.judgeteammap){
        if (v.includes(name)){
          var i = v.indexOf(name);
          v.splice(i,1)
        }
      }
    }
  }
  
  addTeamToJudge(judgeName, e){
    console.log("selected team: ", judgeName, e.target.value);
    var teamName = e.target.value;
    var judgeRef = this.db.collection(this.props.eventName).doc('judges');
    for (let y=0; y<this.props.teamData.length; y++){
      if (this.props.teamData[y].teamName == e.target.value){
        var appName = this.props.teamData[y].appName;
        var school = this.props.teamData[y].school;
        var appDescription = this.props.teamData[y].appDescription;
      }
    }
    this.setState({teamName: teamName});
    this.setState({appName: appName});
    this.setState({school: school});
    var stringof = judgeName+".teams."+teamName;
    var temp ={
      teamName: teamName,
      appName: appName,
      school: school,
      appDescription: appDescription
    };
    judgeRef.update({
      [stringof]: temp
    }).then(function() {
      console.log("Document successfully updated!");
    }).then(result=>{
      this.displayLocalTeam();
    });
    var teamRef = this.db.collection(this.props.eventName).doc('teams');
    var stringof2 = teamName+".scores."+judgeName;
    var temp2 = {
      judgeName: judgeName
    }
    teamRef.update({
      [stringof2]: temp2
    }).then(function() {
      console.log("Document successfully updated!");
    });
  }
  displayLocalTeam(){
    var rows = this.state.rows;
    var row = [this.state.teamName, this.state.appName, this.state.school];
    rows.push(row);
    this.setState({rows: rows});
  }

  displaybyTeam(){
    var teamList = [];
    for (var [k,v] of this.state.teamjudgemap){
      var temp = 
        <Card id= {"displayTeam" + k}>
          <Card.Title><div className="assign-card-title">{k}</div></Card.Title>
          <Card.Body>
            <Table bordered hover responsive id= {"displaybyTeam" + k}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Judge Name</th>
                  <th>Option</th>
                </tr>
              </thead>
                  {this.displayTeamsJudge(k,v)}
            </Table>
           
            <span className="custom-dropdown">
              <select required onChange={(e) => this.recordAddTeam( e)}>
                <option value="" hidden></option>
                {this.props.judgeData.map((x, index)=>(
                  <option key={x.name} value={k+"-"+x.name}>{"Judge: "+x.name}</option>
                ))}
              </select>
            </span>
            
          </Card.Body>
        </Card>
      teamList.push(temp);
    }
    return teamList;
  }
  displayTeamsJudge(tn,judgel){
    var judgeList = [];
    for (let x = 0; x < judgel.length; x++){
      var temp = 
            <tr key={x} id={"assign-team-teamside"+tn+judgel[x]}>
              <td>{x + 1}</td>
              <td>{judgel[x]}</td>
              <td><button className="table-btn assign" type="button"onClick={(e)=>this.deleteRow(judgel[x],tn,judgel[x],"displayTeamsJudge")}>Delete</button></td>
            </tr>   
      judgeList.push(temp);
    }
    return judgeList;
  }

 
  autoAssign(){
    var schoolteamMap = new Map()
    var judgeteamMap = new Map()
    var teamjudgeMap = new Map()
    for (var x in this.props.teamData){
      var teams = [] 
      schoolteamMap.set(this.props.teamData[x].school, teams)
    }
    for(var x in this.props.teamData){
      console.log("schoolname",this.props.teamData[x].school)
      if ([...schoolteamMap.keys()].includes(this.props.teamData[x].school)){
        var currentteams = schoolteamMap.get(this.props.teamData[x].school)
        currentteams.push(this.props.teamData[x].teamName)
      }else{
      }
    }
    //construct maps from database first
    for (var x in this.props.judgeData){
      var teams = [] 
      judgeteamMap.set(this.props.judgeData[x].name, teams)
    }
    for (var x in this.props.teamData){
      var judges = []
      teamjudgeMap.set(this.props.teamData[x].teamName, judges)
    }
    
    var judges = []
    for(var j of judgeteamMap.keys()){
      judges.push(j)
    }
    
    var teams = []
    for (var t of schoolteamMap.values()){
      for (var i in t){
        teams.push(t[i])
      } 
    }
    var output = this.algorithm(judges, teams);
    console.log("biubiubiu: ", output);
    for (var i = 0; i < output.length - 1; i++){
      teams = judgeteamMap.get(output[i][0])
      teams.push(output[i][1])
    }
    for (var i = 0; i < output.length - 1; i++){
      judges = teamjudgeMap.get(output[i][1])
      judges.push(output[i][0])
    }
    this.setState({judgeteammap: judgeteamMap},()=>{console.log(this.state.teamjudgemap);this.autoAssignjSave()})
    //this.setState({schoolteammap: schoolteamMap})
    this.setState({teamjudgemap: teamjudgeMap},()=>{console.log(this.state.teamjudgemap);this.autoAssigntSave()})
  }
  // Auto assign algorithm
  algorithm(judge, team){
    var n = Math.ceil(team.length/judge.length);
    console.log("n: ", n);
    var x = 0;
    var output = [];
    while (x < n){
      var shufflejudge = this.shuffle(judge);
      var y = 0;
      while (y < team.length){
        if (shufflejudge.length >= 1){
          var temp = [shufflejudge[0],team[y]];
          while (this.checkPresent(output,temp)){
            shufflejudge = this.shuffle(shufflejudge);
            temp = [shufflejudge[0], team[y]];
            break;
          }
          if (!this.checkPresent(output,temp)){
            output.push(temp);
            shufflejudge.shift();
            y ++;
          }else{
            shufflejudge = [];
          }
        }else{
          shufflejudge = this.shuffle(judge);
        }
      }
      x++;
    }
    console.log("output: \n",output.sort(), "\nlen: ", output.length);
    return output;
  }
  shuffle(judge){
    for (let i = judge.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
      [judge[i], judge[j]] = [judge[j], judge[i]]; // swap elements
    }
    var judgeCopy = Array.from(judge);
    return judgeCopy;
  }
  checkPresent(sup, sub) {
    var subString = JSON.stringify(sub);
    for (var x = 0; x<sup.length;x++){
      var string = JSON.stringify(sup[x]);
      if (string == subString){
        return true;
      }
    }
    return false;
  }
  autoAssignjSave(){
    var judgeRef = this.db.collection(this.props.eventName).doc('judges');
    for (var [judge, teams] of this.state.judgeteammap.entries()) {
      var temp = {};
        for (let i = 0; i < this.props.teamData.length; i++) {
          for (var t in teams) {
            if (this.props.teamData[i].teamName == teams[t]) {
              temp[this.props.teamData[i].teamName] = {
              teamName: this.props.teamData[i].teamName,
              appName: this.props.teamData[i].appName,
              school: this.props.teamData[i].school,
              appDescription: this.props.teamData[i].appDescription
            }
          }
        }
      }
      var stringOf = judge + ".teams";
      judgeRef.update({
        [stringOf]: temp
      }).then(function (){
        console.log("Judge successfully updated!llll");
      });
    }    
  }
  autoAssigntSave(){
    var teamRef = this.db.collection(this.props.eventName).doc('teams');
    for(var [team,judges] of this.state.teamjudgemap.entries()){
      var temp = {};
      for (let i = 0; i < this.props.judgeData.length; i++) {
        for (var j in judges){
          if (this.props.judgeData[i].name == judges[j]){
            temp[this.props.judgeData[i].name]={
              judgeName: this.props.judgeData[i].name,
              dscore1:null,
              dscore2:null,
              fscore1:null,
              fscore2:null,
              tscore1:null,
              tscore2:null,
              pscore1:null,
              totalScore:null
            }
          }
        }

      }
     
      var stringOf = team + ".scores";
      teamRef.update({
        [stringOf]: temp
      }).then(function() {
        console.log("TEAM HAS successfully updated!");
      });
    }
  }
  saveChanges(){
    var judgeRef = this.db.collection(this.props.eventName).doc('judges');
    for(var judge in this.state.deletejudgeteams){
      for (var t in this.state.deletejudgeteams[judge]){
        var stringof = judge+".teams."+this.state.deletejudgeteams[judge][t]
        let removeteams = judgeRef.update({
          [stringof]: firebase.firestore.FieldValue.delete() 
        }).then(function() {
          console.log("Document successfully updated!");
        });
      } 
    }
    for (var judge in this.state.addjudgesteam){
      for (var t in this.state.addjudgesteam[judge]){
        for (let i = 0; i < this.props.teamData.length; i++) {
          var stringof = judge+".teams."+ this.state.addjudgesteam[judge][t] 
          if (this.state.addjudgesteam[judge][t] == this.props.teamData[i].teamName){
            var temp = {
              teamName: this.props.teamData[i].teamName,
              appName: this.props.teamData[i].appName,
              school: this.props.teamData[i].school,
              appDescription: this.props.teamData[i].appDescription
            }
            judgeRef.update({
              [stringof] : temp
            }).then(function (){
              console.log("Document successfully updated!llll");
            }).catch(function(error) {
              console.log("Error getting document:", error);
            });
          }
        }
      }
    }
    var teamRef = this.db.collection(this.props.eventName).doc('teams');
    for(var team in this.state.deleteteamsjudge){
      for (var j in this.state.deleteteamsjudge[team]){
        var stringof = team+".scores."+this.state.deleteteamsjudge[team][j]
        let removeteams = teamRef.update({
          [stringof]: firebase.firestore.FieldValue.delete() 
        }).then(function() {
          console.log("Document successfully updated!");
        });
      }  
    }
    for (var team in this.state.addteamsjudge){
      for (var j in this.state.addteamsjudge[team]){
        for (let i = 0; i < this.props.judgeData.length; i++) {
          var stringof = team+".scores."+ this.state.addteamsjudge[team][j] 
          if (this.state.addteamsjudge[team][j]  == this.props.judgeData[i].name){
            var temp = {
              judgeName: this.props.judgeData[i].name,
              dscore1 : null,
              dscore2 : null,
              fscore1 : null,
              fscore2 : null,
              tscore1 : null,
              tscore2 : null,
              pscore1 : null,
              totalScore : null,
            }
            teamRef.update({
              [stringof] : temp
            }).then(function (){
              console.log("Document successfully updated!llll");
            }).catch(function(error) {
              console.log("Error getting document:", error);
            });
          }
        }
      }
    }
  }
  
  recordAddTeam(e){
    this.setState({added:false})
    var text = e.target.value
    console.log("e: ", text)
    var values = text.split("-")
    for(var [k,v] of this.state.teamjudgemap){
      if (k == values[0]){
        v.push(values[1])
      }
    }
    for (var [k,v] of this.state.judgeteammap){
      if (k == values[1]){
        v.push(values[0])
      }
    }

    if (this.state.addteamsjudge[values[0]] == null ){
      this.state.addteamsjudge[values[0]] = []
      this.state.addteamsjudge[values[0]].push(values[1])
    }else{
      this.state.addteamsjudge[values[0]].push(values[1])
    }
    if (this.state.addjudgesteam[values[1]] == null){
      this.state.addjudgesteam[values[1]] = []
      this.state.addjudgesteam[values[1]].push(values[0])
    }else{
      this.state.addjudgesteam[values[1]].push(values[0])
    }
    this.setState({added:true})
  }

  recordAddJudge(e){
    this.setState({added:false})
    var text = e.target.value
    var values = text.split("-")
    for(var [k,v] of this.state.teamjudgemap){
      if (k == values[1]){
        v.push(values[0])
      }
    }
    for (var [k,v] of this.state.judgeteammap){
      if (k == values[0]){
        v.push(values[1])
      }
    }
    if (this.state.addteamsjudge[values[1]] == null ){
      this.state.addteamsjudge[values[1]] = []
      this.state.addteamsjudge[values[1]].push(values[0])
    }else{
      this.state.addteamsjudge[values[1]].push(values[0])
    }
    if (this.state.addjudgesteam[values[0]] == null){
      this.state.addjudgesteam[values[0]] = []
      this.state.addjudgesteam[values[0]].push(values[1])
    }else{
      this.state.addjudgesteam[values[0]].push(values[1])
    }
    this.setState({added:true})
  }


  render(){
    return(
      <Container className="panel-content-container"fluid={true}>
        <Row className="panel-row">
          <Col className="panel-col top">
            <h1 className="tab-content-header-h1">Assign teams</h1>
            <button className="autoassign-btn left" onClick = {this.autoAssign.bind(this)}>Auto Assign</button>
            <button className="autoassign-btn right" onClick = {this.saveChanges.bind(this)}>Save</button>
            <button className="logout-btn">< img className="logout-img"onClick={this.onLogout.bind(this)} src={require('../assets/sign-out.png')}></img></button>
          </Col>
          
        </Row>
        <div className="panel-main-wrapper">
          <Container className="panel-main-container" fluid={true}>
            <Row>
              {this.props.eventName=="RUSD" && <Col><p className="header black">Please do not click auto assign for this event.</p></Col>}
              <Col><p className="header black">Event: {this.props.eventName}</p></Col>
            </Row>
            <Row>
              <Col>
                <Tabs className="assign-tabs" defaultActiveKey="Judges" id="noanim-tab-example">
                  <Tab className="assign-tab" eventKey="Judges" title="Judges">
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