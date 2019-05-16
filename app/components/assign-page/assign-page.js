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

class AssignPage extends React.Component{
  constructor(props){
    super(props);
    //var jtm = New map();
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
                  added:false,
                  // addedteam: null,
                  // addedjudge:[]
                };
    console.log("teamdata: ", this.props.teamData);
    console.log("judgedata: ", this.props.judgeData);
    this.db = fire.firestore();
    console.log("lol: ", this.props.teamData2);
  }

  onLogout(e){
    fire.auth().signOut();
  }
  componentDidMount(){
    // window.location.reload();
    var judgeteamMap = new Map()
    console.log(this.props.judgeData)
    for (var x in this.props.judgeData){
      var teams = [] 
      for (let i = 0; i < this.props.judgeData[x].teams.length; i++){
        //console.log(x,this.props.judgeData[x].teams[i][0])
        teams.push(this.props.judgeData[x].teams[i][0])
      }
      judgeteamMap.set(this.props.judgeData[x].name, teams)
    }
    this.setState({judgeteammap: judgeteamMap})
    var teamjudgeMap = new Map()
    console.log(this.props.teamData)
    for (var x in this.props.teamData){
      var judges = [] 
      for (let i = 0; i < this.props.teamData[x].scores.length; i++){
        console.log(x,this.props.teamData[x].scores[i])
        judges.push(this.props.teamData[x].scores[i])
      }
      teamjudgeMap.set(this.props.teamData[x].teamName, judges)
    }
    this.setState({teamjudgemap: teamjudgeMap})
    //console.log(this.state.teamjudgemap)
  }

  displaybyJudge(){
    //TODO: need to prevent users from choosing exiested teams 
    
    var judgeList = [];
    
    for (var [k,v] of this.state.judgeteammap.entries()){
      //console.log(k)
        var temp = 
          <Card>
            <Card.Header as="h5">{k}</Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
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
                    <option key={x.teamName} value={k+"/"+x.teamName}>{k + "/Team:" + x.teamName}</option>
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
              <td>{teaml[x]}</td>
              <td>{this.dispalyJudgesTeam_helper(teaml[x])}</td>
             
              <td><button type="button"onClick={(e)=>this.deleteRow(teaml[x],jn,teaml[x],"displayJudgesTeam")}>Delete</button></td>
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
    console.log("I have been here")
    
    if (caller == "displayJudgesTeam"){
     
      //console.log("deleteRow: ", x,name);
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
      
      //this.state.deletejudgeteams[mastername] = this.state.deleteteams
      //console.log(this.state.deletejudgeteams)
      //console.log(this.state.deleteteamsjudge)
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
      console.log(child3)
      child3.parentNode.removeChild(child3);
      var child4 = document.getElementById("assign-team-judgeside"+ x+mastername);
      child4.parentNode.removeChild(child4);
      console.log(this.state.teamjudgemap)
      
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
    //this.setState({judgeteammap:judgeteammap})
    console.log(this.state.judgeteammap)
    
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
          <Card.Header as="h5" >{k}</Card.Header>
          <Card.Body>
            <Table striped bordered hover responsive id= {"displaybyTeam" + k}>
              <thead>
                <tr>
                  <th>Judge Name</th>
                  <th>Option</th>
                </tr>
              </thead>
                  {this.displayTeamsJudge(k,v)}
                  {/* {this.addJudgeToTeam( )} */}
                  {/* {this.toggleAddOff()} */}
            </Table>
           
            <span className="custom-dropdown">
              <select required onChange={(e) => this.recordAddTeam( e)}>
                <option value="" hidden></option>
                {this.props.judgeData.map((x, index)=>(
                  <option key={x.name} value={k+"/"+x.name}>{"Team:"+k+"  /Judge: "+x.name}</option>
                ))}
              </select>
              {/* <button type="button"onClick={(e)=>this.toggleAddOn()}>Add</button> */}
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
              <td>{judgel[x]}</td>
              <td><button type="button"onClick={(e)=>this.deleteRow(judgel[x],tn,judgel[x],"displayTeamsJudge")}>Delete</button></td>
            </tr>   
      judgeList.push(temp);
    }
    //console.log(this.state.teamjudgemap)
    return judgeList;
  }

 
autoAssign(){
    var schoolteamMap = new Map()
    var teamlist = []
    var judgeteamMap = new Map()
    var teamjudgeMap = new Map()
    for (var x in this.props.teamData){
      var teams = [] 
      schoolteamMap.set(this.props.teamData[x].school, teams)
    }
    for(var x in this.props.teamData){
      //console.log("schoolname",this.props.teamData[x].school)
      if ([...schoolteamMap.keys()].includes(this.props.teamData[x].school)){
        var currentteams = schoolteamMap.get(this.props.teamData[x].school)
        //console.log("thisschools",currentteams)
        currentteams.push(this.props.teamData[x].teamName)
        //schoolteamMap.set(this.props.teamData[x].school, currentteams)
      }else{
        //schoolteamMap.set(this.props.teamData[x].school, teamlist)
      }
    }
    //construct maps from database first
    for (var x in this.props.judgeData){
      var teams = [] 
      // for (var x in this.props.judgeData[x].teams){
      //   teams.push(x)
      // }
      judgeteamMap.set(this.props.judgeData[x].name, teams)
    }
    for (var x in this.props.teamData){
      var judges = []
      // for (var x in this.props.teamData[x].scores){
      //   teams.push(x)
      // }
      teamjudgeMap.set(this.props.teamData[x].teamName, judges)
    }
    //console.log(judgeteamMap)
    //var numberofschool = [...schoolteamMap.keys()].length
    var numberofjudge = this.props.judgeData.length
    var numberofteam = this.props.teamData.length
    var relation = Math.ceil(numberofteam/numberofjudge)
    //Math.ceil(relation)
    //console.log(numberofteam)
    //console.log(relation)
    var numberofiteration = 0
    var judges = []
   
    for(var j of judgeteamMap.keys()){
      judges.push(j)
    }
    
    
    var teams = []
    // while (numberofiteration <= relation){
      for (var t of schoolteamMap.values()){
        for (var i in t){
          teams.push(t[i])
        } 
      }
    
    //console.log(judges)
    //console.log(teams)
   
    var c = 0 
   
    var n = 0
    
    while(n < relation){
      for (var i in teams ){
    
        var currentteams = judgeteamMap.get(judges[c])
        var currentjudges = teamjudgeMap.get(teams[i])
        while(currentteams.includes(teams[i])){
          if (c < judges.length - 1){
            c+= 1
            }else{
            c = 0
            }
        }
        currentteams.push(teams[i])
        currentjudges.push(judges[c])
        judgeteamMap.set(judges[c],currentteams)
        teamjudgeMap.set(teams[i],currentjudges)
        if (c < judges.length - 1){
        c+= 1
        }else{
        c = 0
      }
      
    }
   
    n += 1;
    //console.log(judgeteamMap) 
  }
  //console.log("hhhhh",judgeteamMap) 
  this.setState({judgeteammap: judgeteamMap},()=>{console.log(this.state.teamjudgemap);this.autoAssignjSave()})
  this.setState({schoolteammap: schoolteamMap})
  this.setState({teamjudgemap: teamjudgeMap},()=>{console.log(this.state.teamjudgemap);this.autoAssigntSave()})
  //console.log(this.state.judgeteammap)
}

  

autoAssignjSave(){
  var judgeRef = this.db.collection(this.props.eventName).doc('judges');
  for (var [judge, teams] of this.state.judgeteammap.entries()) {
  var temp = {};
  // console.log("level1: ", judge, teams);
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
  console.log("Document successfully updated!llll");
  });
  }
  //console.log("shima",this.state.judgeteammap)
  
}
autoAssigntSave(){
  //console.log("shima",this.state.teamjudgemap)
  var teamRef = this.db.collection(this.props.eventName).doc('teams');
  //console.log("shima",this.state.teamjudgemap)
  for(var [team,judges] of this.state.teamjudgemap.entries()){
        for (var j in judges){
            var stringof = team+".scores."+judges[j]
            var temp = {
                  judgeName: judges[j]
                 
            }
            teamRef.update({
                [stringof]: temp
              }).then(function() {
                console.log("Document successfully updated!");
              })
        
      
    }
  }
}
saveChanges(){
 
  var judgeRef = this.db.collection(this.props.eventName).doc('judges');
  for(var judge in this.state.deletejudgeteams){
   
        for (var t in this.state.deletejudgeteams[judge]){
          // if (this.props.teamData[i].teamName == this.state.deletejudgeteams[judge][t]){
             var stringof = judge+".teams."+this.state.deletejudgeteams[judge][t]
          //   var temp = {
          //         teamName: this.props.teamData[i].teamName ,
          //         appName: this.props.teamData[i].appName,
          //         school: this.props.teamData[i].school,
          //         appDescription: this.props.teamData[i].appDescription
          //   }
            let removeteams = judgeRef.update({
                [stringof]: firebase.firestore.FieldValue.delete() 
              }).then(function() {
                console.log("Document successfully updated!");
              })
            
        }
      
    }

  for (var judge in this.state.addjudgesteam){
      //console.log("here")
      for (var t in this.state.addjudgesteam[judge]){
        for (let i = 0; i < this.props.teamData.length; i++) {
        var stringof = judge+".teams."+ this.state.addjudgesteam[judge][t] 
        //console.log("here", this.props.teamData[i])
        if (this.state.addjudgesteam[judge][t] == this.props.teamData[i].teamName){
          //console.log("here", this.props.teamData[i])
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
          // if (this.props.teamData[i].teamName == this.state.deletejudgeteams[judge][t]){
            var stringof = team+".scores."+this.state.deleteteamsjudge[team][j]
          //   var temp = {
          //         teamName: this.props.teamData[i].teamName ,
          //         appName: this.props.teamData[i].appName,
          //         school: this.props.teamData[i].school,
          //         appDescription: this.props.teamData[i].appDescription
          //   }
            let removeteams = teamRef.update({
                [stringof]: firebase.firestore.FieldValue.delete() 
              }).then(function() {
                console.log("Document successfully updated!");
              })
            
        }
      
    }

    for (var team in this.state.addteamsjudge){
      console.log("here")
      for (var j in this.state.addteamsjudge[team]){
        for (let i = 0; i < this.props.judgeData.length; i++) {
        var stringof = team+".scores."+ this.state.addteamsjudge[team][j] 
        console.log("here", this.props.judgeData[i])
        if (this.state.addteamsjudge[team][j]  == this.props.judgeData[i].name){
          console.log("here", this.props.judgeData[i])
          var temp = {
            judgeName: this.props.judgeData[i].name,
            dscore1 : null,
            dscore2 : null,
            fscore1 : null,
            fscore2 : null,
            tscore1 : null,
            tscore2 : null,
            pscore1 : null,
            totalScore : 0,
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
    var values = text.split("/")
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

    console.log("kkkk",this.state.addteamsjudge)
    console.log("llllll",this.state.addjudgesteam)
    this.setState({added:true})
    //change judgeteammap
}

recordAddJudge(e){
  this.setState({added:false})
  var text = e.target.value
    console.log("e: ", text)
    var values = text.split("/")
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

    console.log("kkkk",this.state.addteamsjudge)
    console.log("llllll",this.state.addjudgesteam)
    this.setState({added:true})
}


  render(){
    return(
      <Container className="panel-content-container"fluid={true}>
        <Row className="panel-row">
          <Col className="panel-col top">
            <h1 className="tab-content-header-h1">Assign teams</h1>
            <button className="logout-btn">< img className="logout-img"onClick={this.onLogout.bind(this)} src={require('../assets/sign-out.png')}></img></button>
          </Col>
        </Row>

        <div className="panel-main-wrapper">
          <Row>
            <Col>
              <Tabs defaultActiveKey="Judges" id="noanim-tab-example">
                <Tab eventKey="Judges" title="Judges">
                  <button onClick = {this.saveChanges.bind(this)}>SAVE</button>
                  <button onClick = {this.autoAssign.bind(this)}>Auto Assign(Not Working)</button>
                  {this.displaybyJudge()}
                  
                </Tab>

                <Tab eventKey="Teams" title="Teams">
                  <button onClick = {this.saveChanges.bind(this)}>SAVE</button>
                  {this.displaybyTeam()}
                </Tab>
              </Tabs>
            </Col> 
          </Row>
        </div>
      </Container>
    );
  }
}

// export default withRouter(TeamPage);
export default AssignPage;