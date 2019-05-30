import firebase from 'firebase';

const config = {
  // test db
  // apiKey: "AIzaSyBYz9ACZunkhGs3ByUY2d_n4pMSpsinI0g",
  // authDomain: "dfs-appjam-judging-app.firebaseapp.com",
  // databaseURL: "https://dfs-appjam-judging-app.firebaseio.com",
  // projectId: "dfs-appjam-judging-app",
  // storageBucket: "dfs-appjam-judging-app.appspot.com",
  // messagingSenderId: "1062970629056",
  // appId: "1:1062970629056:web:7da687873ab90bfe"
  apiKey: "AIzaSyBfpYymCpM_tF95M-KgfcXE0eaF5wCIOy8",
  authDomain: "dfs-judging-application.firebaseapp.com",
  databaseURL: "https://dfs-judging-application.firebaseio.com",
  projectId: "dfs-judging-application",
  storageBucket: "dfs-judging-application.appspot.com",
  messagingSenderId: "300010332303",
  appId: "1:300010332303:web:c0208b37ac99d8a0"
};
const fire = firebase.initializeApp(config);
export default fire;