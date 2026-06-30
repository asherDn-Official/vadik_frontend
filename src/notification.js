import {
  getToken,
  onMessage,
} from "firebase/messaging";

import { messaging } from "./firebase";

import api from "./api/apiconfig";

export const requestPermission =
  async (retailerId) => {

    try {

      /*
        Browser Permission
      */

      const permission =
        await Notification.requestPermission();

      if (permission !== "granted") {
        return;
      }

      

      /*
        Register Service Worker
      */

     const registration =
  await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js"
  );

await navigator.serviceWorker.ready;

      /*
        Existing Token
      */

      const existingToken =
        localStorage.getItem(
          "fcmToken"
        );

      /*
        Generate Token
      */

      const token =
        await getToken(
          messaging,
          {
            vapidKey:
              import.meta.env
                .VITE_FIREBASE_VAPID_KEY,

            serviceWorkerRegistration:
              registration,
          }
        );

      if (!token) {
        console.log(
          "No FCM token"
        );
        return;
      }

      /*
        Save Only If Changed
      */

     localStorage.setItem(
  "fcmToken",
  token
);

await api.post(
  "/api/save-fcm-token",
  {
    retailerId,
    token,

    device:
      navigator.platform,

    browser:
      navigator.userAgent,
  }
);


console.log(
  "FCM Token Updated"
);

      console.log(
        "FCM TOKEN:",
        token
      );

      await api.post(
  "/api/send-login-notification",
  {
    retailerId
  }
);

// await api.post(
//   "/api/check-login-events",
//   {
//     retailerId
//   }
// );
console.log(
  "Login Notification Sent"
);

    } catch (error) {

      console.error("FCM Error:", error);
console.error("Code:", error.code);
console.error("Message:", error.message);
console.error("Stack:", error.stack);
console.log(
  "VAPID KEY:",
  import.meta.env.VITE_FIREBASE_VAPID_KEY
);

    }

};

/*
  Foreground Notifications
*/

export const listenNotifications =
  () => {

    onMessage(

  messaging,

  async (payload) => {

    console.log(
      "Foreground Notification:",
      payload
    );

    /*
      STOP DUPLICATE
    */

    if (
      document.visibilityState !==
      "visible"
    ) {
      return;
    }

    const title =

      payload?.notification?.title ||

      payload?.data?.title ||

      "Vadik AI";

    const body =

      payload?.notification?.body ||

      payload?.data?.body ||

      "New notification";

    const registration =

      await navigator
        .serviceWorker
        .ready;

registration.showNotification(

  title,

  {

    body,

    icon:
      "/favicon.ico",

    badge:
      "/favicon.ico",

    requireInteraction:
      true,

    actions: [

      {
        action: "open",
        title: "Open"
      },

      {
        action: "close",
        title: "Dismiss"
      }

    ]

  }

);

  }

);

};