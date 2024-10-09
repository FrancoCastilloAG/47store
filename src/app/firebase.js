// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

/* const firebaseConfig = {
    apiKey: "AIzaSyAP7i4El2C1amPkMn6ICPcXrZlpPdzMjYw",
    authDomain: "krazykraft-11a5e.firebaseapp.com",
    databaseURL: "https://krazykraft-11a5e-default-rtdb.firebaseio.com",
    projectId: "krazykraft-11a5e",
    storageBucket: "krazykraft-11a5e.appspot.com",
    messagingSenderId: "868762954526",
    appId: "1:868762954526:web:3b0c84b507af4eee57f70f",
    measurementId: "G-TEH7B4W8YV"
}; */
const firebaseConfig = {
    apiKey: "AIzaSyAZ9ljZNdEvO_KiOR_Hx8n6tSlvjHhySxc",
    authDomain: "store-f3ffe.firebaseapp.com",
    projectId: "store-f3ffe",
    storageBucket: "store-f3ffe.appspot.com",
    messagingSenderId: "837292932874",
    appId: "1:837292932874:web:f7e98e19fa85bbd9a584f3"
  };

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();
const firestore = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);


export { auth, provider, signInWithPopup ,firestore,storage };
