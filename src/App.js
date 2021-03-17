import './App.css';
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';
import { useState } from 'react';


function App() {
  const provider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  } else {
    firebase.app(); // if already initialized, use that one
  }
  const [newUser, setNewUser] = useState(false)
  const [user, setUser] = useState({
    isSign: false,
    newUser: false,
    name: '',
    email: '',
    password: '',
    photo: ''
  })
  const signIn = () => {
    firebase.auth()
      .signInWithPopup(provider)
      .then((result) => {
        var credential = result.credential;
        var token = credential.accessToken;
        var user = result.user;
        const { displayName, email, photoURL } = result.user;
        const isSignUser = {
          isSign: true,
          name: displayName,
          email: email,
          photo: photoURL
        }
        setUser(isSignUser)
      }).catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        var email = error.email;
        var credential = error.credential;
        console.log(errorCode, errorMessage, email, credential)
      });
  }
  const signOut = () => {
    firebase.auth()
      .signOut()
      .then(() => {
        const isSignUserOut = {
          isSign: false,
          name: '',
          email: '',
          photo: '',
          error: '',
          success: false
        }
        setUser(isSignUserOut)
      }).catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        var email = error.email;
        var credential = error.credential;
        console.log(errorCode, errorMessage, email, credential)
      });
  }

  const handleBlur = (e) => {
    let isFieldValid = true;
    console.log(e.target.name, e.target.value)
    if (e.target.name === "email") {
      isFieldValid = /\S+@\S+\.\S+/.test(e.target.value)

    }
    if (e.target.name === "password") {
      const isPasswordValid = e.target.value.length > 6;
      const passwordHasNumber = /\d{1}/.test(e.target.value)
      isFieldValid = (isPasswordValid && passwordHasNumber)
    }
    if (isFieldValid) {
      const newUserInfo = { ...user }
      newUserInfo[e.target.name] = e.target.value
      setUser(newUserInfo)
    }
  }
  const handleSubmit = (e) => {
    console.log(user.email, user.password)
    if (newUser && user.email && user.password) {
      firebase.auth()
        .createUserWithEmailAndPassword(user.email, user.password)
        .then((res) => {
          const newUserInfo = { ...user }
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo)
          updateUserName(user.name);
        })
        .catch((error) => {
          const newUserInfo = { ...user };
          newUserInfo.error = error.errorMessage;
          newUserInfo.success = false;
          setUser(newUserInfo)
        });
    }
    if (!newUser && user.email && user.password) {
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then((res) => {
          const newUserInfo = { ...user }
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo)
          console.log('sign in user info', res.user)
        })
        .catch((error) => {
          const newUserInfo = { ...user };
          newUserInfo.error = error.errorMessage;
          newUserInfo.success = false;
          setUser(newUserInfo)
        });
    }
    e.preventDefault();
  }

  const updateUserName = name => {
    const user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name
    }).then(function () {
      console.log('user name updated successfully')
    }).catch(function (error) {
    });
  }

  const fbSignUp = () => {
    firebase
      .auth()
      .signInWithPopup(fbProvider)
      .then((result) => {
        var credential = result.credential;
        var user = result.user;
        var accessToken = credential.accessToken;
        console.log(user)
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        var email = error.email;
        var credential = error.credential;
      });
  }

  return (
    <div className="App">
      {
        user.isSign ?
          <button onClick={signOut}>Sign Out</button> :
          <button onClick={signIn}>Sign In</button>
      }
      <br />
      <button onClick={fbSignUp}>Sign In by Facebook</button>
      {
        user.isSign && <div>
          <h3>User Name: {user.name}</h3>
          <h1>User Email: {user.email}</h1>
          <img src={user.photo} alt={user.photo} />
        </div>
      }
      <h1>Out Own Authentication</h1>
      {/* <p>Email: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Password: {user.password}</p> */}

      <input onChange={() => { setNewUser(!newUser) }} type="checkbox" name="newUser" id="" />
      <label htmlFor="newUser">New User Sign Up</label>

      <form onSubmit={handleSubmit} action="">
        {newUser && <input onBlur={handleBlur} type="text" name="name" placeholder="Yourname" />}<br />
        <input onBlur={handleBlur} type="email" name="email" placeholder="email" required /><br />
        <input onBlur={handleBlur} type="password" name="password" placeholder="password" required /><br />
        <input type="submit" value={newUser ? 'Sign Up' : 'Sign In'} />
      </form>
      {
        user.success ?
          <p style={{ color: "green" }}>User {newUser ? 'Created' : 'Logged'} In Successfully</p> :
          <p style={{ color: "red" }}>{user.error}</p>
      }
    </div>
  );
}

export default App;
