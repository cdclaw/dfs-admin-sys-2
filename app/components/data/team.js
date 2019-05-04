class TeamObj {

  constructor(teamName, appName, school, appDescription, scores){
    this.teamName = teamName;
    this.appName = appName;
    this.school = school;
    this.appDescription = appDescription;
    this.scores = [];
    for (var judge in scores){
      var name = scores[judge].judgeName;
      this.scores.push(name);
    }
  }

}
module.exports = TeamObj;