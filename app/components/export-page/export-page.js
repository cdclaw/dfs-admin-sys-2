import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import fire from '../config/firebase';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
require('./export-page.css');

class ExportPage extends React.Component{
  constructor(props){
    super(props);
    this.db = fire.firestore();
  }

  update_database(name, value){
    var stringof = name + ".totalNorScore";
    this.db.collection(this.props.eventName).doc("teams").update({
      [stringof]:value
    })
    .then(function() {
      console.log("Document successfully updated!");
    });
  }

  onLogout(e){
    fire.auth().signOut();
  }

  team_list(){
    var teamlist = [];
    for (var i in this.props.teamData2){
      teamlist.push(this.props.teamData2[i].teamName);
    }
    return teamlist;
  }

  judge_list(){
    var judgelist = [];
    for (var i in this.props.judgeData){
      judgelist.push(this.props.judgeData[i].name);
    }
    return judgelist;
  }

  row_list(name){
    var row_info = [];
    for (var i in this.props.teamData2){
      let data = this.props.teamData2[i].scores;
      let check = [];
      for (var j in this.props.teamData2[i].scores){
        if (name == j){
          row_info.push(this.props.teamData2[i].scores[j].totalScore);
          check.push(this.props.teamData2[i].scores[j].totalScore);
        }
      }
      if (check.length==0){
        row_info.push(0);
      }
    }
    return row_info;
  }

  display_nor_data(){
    let table = [];
    let table2 = [];
    var teamlist = this.team_list();   
    var judgelist = this.judge_list();
    let first_row = [];

    first_row.push(<th>&nbsp;Judges\Teams</th>);
    for (var i in teamlist){
      first_row.push(<th>&nbsp;{teamlist[i]}</th>);
    }
    table.push(<tr>{first_row}</tr>);

    let raw_max_min = [];
    let z_max_min = [];

    for (var j in judgelist){
      let row = [];
      let z_list = [];
      row.push(<td>&nbsp;{judgelist[j]}</td>);
      var judge = judgelist[j];

      let rowlist = this.row_list(judge);

      var count = 0;
      var count_number = 0;
      for (var i in rowlist){
        if (rowlist[i] != 0){
          raw_max_min.push(rowlist[i]);
          count_number = count_number + 1;
          count = count + rowlist[i];
        }
      }

      var row_mean = count/parseFloat(count_number);

      var row_std_count = 0;
      for (var i in rowlist){
        if (rowlist[i] != 0){
          row_std_count = row_std_count + (rowlist[i]- row_mean) * (rowlist[i] - row_mean);
        }
      }

      var row_std = Math.sqrt(row_std_count/(parseFloat(count_number)-1.0));

      for (var i in rowlist){
        if (rowlist[i] != 0){
          z_max_min.push((rowlist[i] - row_mean)/parseFloat(row_std));
          z_list.push( (rowlist[i] - row_mean)/parseFloat(row_std) );
        }
        else{
          z_list.push(0);
        }
      }

      for (var i in z_list){
        row.push(<td>&nbsp;{z_list[i]}</td>);
      }
    }

    for (var j in judgelist){
      let row = []; 
      let row2 = [];
      let z_list = [];
      row.push(<td>&nbsp;{judgelist[j]}</td>);
      var judge = judgelist[j];

      let rowlist = this.row_list(judge);

      var count = 0;
      var count_number = 0;
      for (var i in rowlist){
        if (rowlist[i] != 0){
          count_number = count_number + 1;
          count = count + rowlist[i];
        }
      }

      var row_mean = count/parseFloat(count_number);

      var row_std_count = 0;
      for (var i in rowlist){
        if (rowlist[i] != 0){
          row_std_count = row_std_count + (rowlist[i]- row_mean) * (rowlist[i] - row_mean);
        }
      }

      var row_std = Math.sqrt(row_std_count/(parseFloat(count_number)));

      var RawMax = raw_max_min.sort().reverse()[0];
      var RawMin = raw_max_min.sort()[0];

      var ZMax = z_max_min.sort().reverse()[0];
      var ZMin = z_max_min.sort(function(a,b) { return a - b; })[0];

      for (var i in rowlist){
        if (rowlist[i] != 0){
          var z_score = (rowlist[i] - row_mean)/parseFloat(row_std);
          var rescaled_value = (RawMax+RawMin)/2.0 + (parseFloat((RawMax-RawMin)) / ( (ZMax-ZMin)) * (z_score - (ZMax+ZMin)/2.0) );
          z_list.push( rescaled_value.toFixed(2) );
        }
        else{
          z_list.push(0);
        }
      }

      for (var i in z_list){
        row.push(<td>&nbsp;{z_list[i]}</td>);
        row2.push(z_list[i]);
      }

      table.push(<tr>{row}</tr>);
      table2.push(row2);

    }

    let row3 = [];
    row3.push(<td>&nbsp;Total Score</td>);
    for (var i in teamlist){
      var total_count = 0;
      for (var j in table2){
        total_count = total_count + parseFloat(table2[j][i]);
      }
      this.update_database(teamlist[i],total_count.toFixed(2));
      row3.push(<td>&nbsp;{total_count.toFixed(2)}</td>);
    }

    table.push(row3);
    return table;
  }

  display_raw_data(){
    let table = [];
    var teamlist = this.team_list();   
    var judgelist = this.judge_list();
    let first_row = [];
    first_row.push(<th>&nbsp;Judges\Teams</th>);
    for (var i in teamlist){
      first_row.push(<th>&nbsp;{teamlist[i]}</th>);
    }
    table.push(<tr>{first_row}</tr>);

    for (var j in judgelist){
      let row = [];
      row.push(<td>&nbsp;{judgelist[j]}</td>);
      var judge = judgelist[j];

      let rowlist = this.row_list(judge);
      for (var i in rowlist){
        row.push(<td>&nbsp;{rowlist[i]}</td>);
      }
      table.push(<tr>{row}</tr>);
    }
    return table;
  }

  display_winner(){
    let table = [];
    let first_row = [];

    first_row.push(<th>&nbsp;Place</th>);
    first_row.push(<th>&nbsp;Score</th>);
    first_row.push(<th>&nbsp;Team Name</th>);
    table.push(<tr>{first_row}</tr>);

    var winner_dict = {};
    let tt = [];
    for (var i in this.props.teamData2){
      winner_dict[this.props.teamData2[i].teamName]= parseFloat(this.props.teamData2[i].totalNorScore);
      tt.push(parseFloat(this.props.teamData2[i].totalNorScore));
    }

    tt.sort(function(a,b) { return b-a ; });

    var count = 1;
    for (var i in tt){
      for (var j in winner_dict){
        if (winner_dict[j] == tt[i] && count <= 5){
          let row = [];
          row.push(<td>&nbsp;{count+'st'}</td>);
          row.push(<td>&nbsp;{tt[i]}</td>);
          row.push(<td>&nbsp;{j}</td>);
          table.push(<tr>{row}</tr>);
          count = count + 1;
        }
      }
    }
    return table;
  }

  render(){

    return(
      <Container className="panel-content-container"fluid={true}>
        <Row className="panel-row">
          <Col className="panel-col top">
            <h1 id="nihao" className="tab-content-header-h1">Export to CSV</h1>
            <button className="logout-btn"><img className="logout-img"onClick={this.onLogout.bind(this)} src={require('../assets/sign-out.png')}></img></button>
          </Col>
        </Row>
        <div className="panel-main-wrapper">
          <Container className="panel-main-container" fluid={true}>
            <Row>
              <Col>
                <Row>
                  <Col>
                    <div className="export-t-div">
                      <table id="1" className="export-table">
                        {this.display_raw_data()}
                      </table>
                    </div>
                    <ReactHTMLTableToExcel
                      id="test-table-xls-button"
                      className="table-btn export"
                      table="1"
                      filename="tablexls"
                      sheet="tablexls"
                      buttonText="Export raw data to Excel"/>
                    <div className="export-t-div">
                      <table id="2" className="export-table">
                        {this.display_nor_data()}
                      </table>
                    </div>
                    <ReactHTMLTableToExcel
                      id="test-table-xls-button"
                      className="table-btn export"
                      table="2"
                      filename="tablexls"
                      sheet="tablexls"
                      buttonText="Export normalized data to Excel"/>
                    <div className="export-t-div">
                      <table id="3" className="export-table">
                        {this.display_winner()}
                      </table>
                    </div>
                    <ReactHTMLTableToExcel
                      id="test-table-xls-button"
                      className="table-btn export last"
                      table="3"
                      filename="tablexls"
                      sheet="tablexls"
                      buttonText="Export Winner data to Excel"/>
                  </Col>
                </Row>
              </Col> 
            </Row>
          </Container>
        </div>
      </Container>
    );
  }
}
export default ExportPage;