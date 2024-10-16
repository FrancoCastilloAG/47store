import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

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
