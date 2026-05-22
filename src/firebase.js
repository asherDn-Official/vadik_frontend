import { initializeApp } from "firebase/app";

import {
  getMessaging,
} from "firebase/messaging";

/*
  Firebase Configuration
*/

const firebaseConfig = {
  apiKey: "AIzaSyBXTX33DK_iNee4ZDvt4hTQr6O-pgt8zOE",

  authDomain: "vadik-777.firebaseapp.com",

  projectId: "vadik-777",

  storageBucket: "vadik-777.firebasestorage.app",

  messagingSenderId: "880226866756",

  appId:
    "1:880226866756:web:372af5386ba9bd54900e11",

  measurementId: "G-HV06KGETMR",
};
const app =
  initializeApp(
    firebaseConfig
  );

const messaging =
  getMessaging(app);

export { messaging };