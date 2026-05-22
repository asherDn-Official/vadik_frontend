importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

firebase.initializeApp({

  apiKey:
    "AIzaSyBXTX33DK_iNee4ZDvt4hTQr6O-pgt8zOE",

  authDomain:
    "vadik-777.firebaseapp.com",

  projectId:
    "vadik-777",

  storageBucket:
    "vadik-777.firebasestorage.app",

  messagingSenderId:
    "880226866756",

  appId:
    "1:880226866756:web:372af5386ba9bd54900e11",

});

const messaging =
  firebase.messaging();

messaging.onBackgroundMessage(

  function (payload) {

    console.log(
      "Background Notification:",
      payload
    );

    const title =

      payload?.notification?.title ||

      payload?.data?.title ||

      "Vadik AI";

    const body =

      payload?.notification?.body ||

      payload?.data?.body ||

      "New Notification";

    self.registration.showNotification(

      title,

      {

        body,

        icon:
          "/favicon.ico",

        badge:
          "/favicon.ico",

      }

    );

  }

);

self.addEventListener(

  "notificationclick",

  function (event) {

    event.notification.close();

    if (
      event.action === "close"
    ) {
      return;
    }

    event.waitUntil(

      clients.openWindow(
        "http://localhost:5173/dashboard"
      )

    );

  }

);