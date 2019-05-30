import firebase from 'firebase';

const config = {
  apiKey: "AIzaSyBYz9ACZunkhGs3ByUY2d_n4pMSpsinI0g",
  authDomain: "dfs-appjam-judging-app.firebaseapp.com",
  databaseURL: "https://dfs-appjam-judging-app.firebaseio.com",
  projectId: "dfs-appjam-judging-app",
  storageBucket: "dfs-appjam-judging-app.appspot.com",
  messagingSenderId: "1062970629056",
  appId: "1:1062970629056:web:7da687873ab90bfe"
};
const fire = firebase.initializeApp(config);
export default fire;