import firebase from 'firebase';

const config = {
  apiKey: "AIzaSyAwuvqP0_qbAZcFKfazmBSINZR-RtaQRJM",
  authDomain: "dfs-judging-app.firebaseapp.com",
  databaseURL: "https://dfs-judging-app.firebaseio.com",
  projectId: "dfs-judging-app",
  storageBucket: "dfs-judging-app.appspot.com",
  messagingSenderId: "200739270482",
  appId: "1:200739270482:web:3ef0e38d0d832c55"
};
const fire = firebase.initializeApp(config);
export default fire;