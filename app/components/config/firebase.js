import firebase from 'firebase';

const config = {
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