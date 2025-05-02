// Replace these config values with your actual Firebase project values

const firebaseConfig = {
  apiKey: "AIzaSyBOWAl0lniA1-UeMcPeItCJ5JF2jrCzbxU",
  authDomain: "cirtbantstoragetest.firebaseapp.com",
  databaseURL: "https://cirtbantstoragetest-default-rtdb.firebaseio.com",
  projectId: "cirtbantstoragetest",
  storageBucket: "cirtbantstoragetest.firebasestorage.app",
  messagingSenderId: "474009139591",
  appId: "1:474009139591:web:3a5c236fd8cfdd1f623b22",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
