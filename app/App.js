import React, {Component} from 'react';
import fire from './components/config/firebase';
import Events from './components/events/Events';
import PanelFrame from './components/menu/panel-frame';
import LoginPage from './components/login/Login';
var JudgeObj = require('./components/data/judge');
var TeamObj = require('./components/data/team');
var TeamObj2 = require('./components/data/team2');

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      user: {},
      judgeData: null,
      teamData: null,
      teamDate2: null
    }
    this.db = fire.firestore();
  }
  componentDidMount(){
    this.authListener();
    this.getTeamData2();
  }
  getTeamData2() {
    var docRef = this.db.collection('event-19').doc('teams');
    docRef.get().then(function (doc) {
      if (doc.exists) {
        console.log("Team data:", doc.data());
        var teamList = [];
        for (var x in doc.data()) {
          var temp = new TeamObj2(doc.data()[x].teamName, doc.data()[x].appName, doc.data()[x].scores, doc.data()[x].totalNorScore, doc.data()[x].school);
          teamList.push(temp);
        }
        return (teamList)
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    }).then(teamList => {
      this.setState({ teamData2: teamList });
    })
      .catch(function (error) {
        console.log("Error getting document:", error);
      });
  }

  authListener() {
    fire.auth().onAuthStateChanged ((user)=> {
      if (user) {
        this.setState({user});
        // localStorage.setItem('user', user.uid);
      } else{
        this.setState({user: null});
        // localStorage.removeItem('user');
      }
    });
  }
  render(){
    return (
      <div>
        {this.state.user && this.state.teamData2? (<Events teamData2={this.state.teamData2}></Events>) : (<LoginPage></LoginPage>)}
      </div>
    )
  }
}
export default App;
