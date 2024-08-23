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
    apiKey: "AIzaSyBSawl7zz_hwMaKwJiHQ6JO4EFdK_0qP10",
    authDomain: "cbsh-ba4a3.firebaseapp.com",
/*     databaseURL: "https://cbsh-ba4a3-default-rtdb.firebaseio.com", */
    projectId: "cbsh-ba4a3",
    storageBucket: "cbsh-ba4a3.appspot.com",
    messagingSenderId: "646551715214",
    appId: "1:646551715214:web:4c4a9a4ae8363c8aed78df",
    measurementId: "G-RTDC5ZR6V7"
  };

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();
const firestore = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);


export { auth, provider, signInWithPopup ,firestore,storage };
