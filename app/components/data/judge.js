class JudgeObj {

  constructor(name, email, password, teams){
    this.name = name;
    this.email = email;
    this.password = password;
    this.teams = [];
    for (var t in teams){
      var temp = [];
      temp.push(teams[t].teamName, teams[t].appName, teams[t].school, teams[t].appDescription);
      this.teams.push(temp);
    }
  }

}
module.exports = JudgeObj;