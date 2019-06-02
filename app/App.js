import React, {Component} from 'react';
import fire from './components/config/firebase';
import Events from './components/events/Events';
import LoginPage from './components/login/Login';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      user: {}
    }
    this.db = fire.firestore();
  }
  componentDidMount(){
    this.authListener();
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
        {this.state.user? (<Events></Events>) : (<LoginPage></LoginPage>)}
      </div>
    )
  }
}
export default App;
