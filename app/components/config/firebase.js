import firebase from 'firebase';

const config = {
  // apiKey: "AIzaSyAwuvqP0_qbAZcFKfazmBSINZR-RtaQRJM",
  // authDomain: "dfs-judging-app.firebaseapp.com",
  // databaseURL: "https://dfs-judging-app.firebaseio.com",
  // projectId: "dfs-judging-app",
  // storageBucket: "dfs-judging-app.appspot.com",
  // messagingSenderId: "200739270482",
  // appId: "1:200739270482:web:3ef0e38d0d832c55"
  apiKey: "AIzaSyCFDWTDyHT6HmK-hhTUFbRhef8RqCDHA0c",
  authDomain: "dfs-test-40e96.firebaseapp.com",
  databaseURL: "https://dfs-test-40e96.firebaseio.com",
  projectId: "dfs-test-40e96",
  storageBucket: "dfs-test-40e96.appspot.com",
  messagingSenderId: "948603196305",
  appId: "1:948603196305:web:2fd15966c1d9517e"
};
const fire = firebase.initializeApp(config);
export default fire;