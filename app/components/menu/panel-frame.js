import React from 'react';
import Container from 'react-bootstrap/Container';
import Tab from 'react-bootstrap/Tab';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
require('./menu-frame.css');
import TeamPage from '../teams-page/teams-page';
import JudgePage from '../judges-page/judges-page';
import AssignPage from '../assign-page/assign-page';


class PanelFrame extends React.Component{
  constructor(props){
    super(props);
  }

  render(){
    return(
      <Tab.Container id="left-tabs" defaultActiveKey="Judges">
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
                <Nav.Link eventKey="TotalCalculation">Total Calculation</Nav.Link>
                <Nav.Link eventKey="Winner">Winner !</Nav.Link>
              </Nav.Item>
              
            </Nav>
          </Col>

          <Col className="panel-col" sm={10} xl={11}>
            <Tab.Content>
              <Tab.Pane eventKey="Judges"><JudgePage eventName={this.props.eventName} judgeData={this.props.judgeData}></JudgePage></Tab.Pane>
              <Tab.Pane eventKey="Teams"><TeamPage eventName={this.props.eventName} teamData={this.props.teamData} ></TeamPage></Tab.Pane>
              <Tab.Pane eventKey="AssignTeams"><AssignPage eventName={this.props.eventName} teamData={this.props.teamData} judgeData={this.props.judgeData}></AssignPage></Tab.Pane>
              {/* <Tab.Pane eventKey="TotalCalculation"><Ap teamData={this.props.teamData} teamData2={this.props.teamData2} judgeData={this.props.judgeData}></Ap></Tab.Pane> */}

            </Tab.Content>
          </Col>
        </Row>

      </Tab.Container>
    )
  }
}
export default PanelFrame;