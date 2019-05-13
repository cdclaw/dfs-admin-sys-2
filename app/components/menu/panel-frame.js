import React from 'react';
import { Container, Row, Col, Nav, Tab } from 'react-bootstrap';
require('./menu-frame.css');
import TeamPage from '../teams-page/teams-page';
import JudgePage from '../judges-page/judges-page';
import AssignPage from '../assign-page/assign-page';
import TotalPage from '../total-page/total-page';
import WinnerPage from '../winner-page/winner-page';
import ExportPage from '../export-page/export-page';


class PanelFrame extends React.Component{
  constructor(props){
    super(props);
  }

  render(){
    return(
      <Tab.Container id="left-tabs" defaultActiveKey="AssignTeams">
        <Row className="panel-row">
          <Col className="panel-col left" sm={2} xl={1}>
            <div className="panel-logo-div">
              <img className="panel-logo"src={require('../assets/dfs_programlogo_appjam_stacked.png')}></img>
            </div>
            <h1 className="panel-menu-label">Menu</h1>
            <Nav variant="pills" className="flex-column">
              <Nav.Item>
                <Nav.Link eventKey="Judges">Judges</Nav.Link>
                <Nav.Link eventKey="Teams">Teams</Nav.Link>
                <Nav.Link eventKey="AssignTeams">Assign Teams</Nav.Link>
                <Nav.Link eventKey="TotalScore">Total Score</Nav.Link>
                <Nav.Link eventKey="Export">Export</Nav.Link>
                <Nav.Link eventKey="Winner">Winner !</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>

          <Col className="panel-col" sm={10} xl={11}>
            <Tab.Content>
              <Tab.Pane eventKey="Judges"><JudgePage eventName={this.props.eventName} judgeData={this.props.judgeData}></JudgePage></Tab.Pane>
              <Tab.Pane eventKey="Teams"><TeamPage eventName={this.props.eventName} teamData={this.props.teamData} ></TeamPage></Tab.Pane>
              <Tab.Pane eventKey="AssignTeams"><AssignPage eventName={this.props.eventName} teamData={this.props.teamData} judgeData={this.props.judgeData}></AssignPage></Tab.Pane>
              <Tab.Pane eventKey="TotalScore"><TotalPage judgeData={this.props.judgeData} teamData={this.props.teamData} teamData2={this.props.teamData2}></TotalPage></Tab.Pane>
              <Tab.Pane eventKey="Export"><ExportPage judgeData={this.props.judgeData} teamData={this.props.teamData} teamData2={this.props.teamData2}></ExportPage></Tab.Pane>
              <Tab.Pane eventKey="Winner"><WinnerPage eventName={this.props.eventName} judgeData={this.props.judgeData} teamData={this.props.teamData} teamData2={this.props.teamData2}></WinnerPage></Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>

      </Tab.Container>
    )
  }
}
export default PanelFrame;