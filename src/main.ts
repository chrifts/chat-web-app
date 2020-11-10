import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import vuetify from "./plugins/vuetify";
import dotenv from 'dotenv';

dotenv.config();

//GET CONFIG VALUE FROM ENV FILE
const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_CONFIG_apiKey,
  authDomain: process.env.VUE_APP_FIREBASE_CONFIG_authDomain,
  databaseURL: process.env.VUE_APP_FIREBASE_CONFIG_databaseURL,
  projectId: process.env.VUE_APP_FIREBASE_CONFIG_projectId,
  storageBucket: process.env.VUE_APP_FIREBASE_CONFIG_storageBucket,
  messagingSenderId: process.env.VUE_APP_FIREBASE_CONFIG_messagingSenderId,
  appId: process.env.VUE_APP_FIREBASE_CONFIG_appId,
  measurementId: process.env.VUE_APP_FIREBASE_CONFIG_measurementId
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

let app: any;
const urlApi: string = process.env.NODE_ENV == 'development' ? process.env.VUE_APP_API! : process.env.VUE_APP_API_PROD!;
const init = () => {
  if (!app) {
    app = new Vue({
      router,
      store,
      vuetify,
      data: ()=>({
        urlApi: urlApi 
      }),
      beforeCreate: ()=> {
        store.commit("setMainLoading", true);
        console.log(store.getters.mainLoading)
      },
      render: h => h(App)
    }).$mount("#app");
  }
};

init();

firebase.auth().onAuthStateChanged(user => {
  if (user) {
    firebase.database().ref('users/' + user.uid).once("value")
    .then((snapshot)=> {
      const theUser = {
        uid: user.uid,
        email: user.email,
        firstName: snapshot.val().firstName,
        lastName: snapshot.val().lastName,
      }
      store.commit("setUser", theUser);
      store.commit("setMainLoading", false);
      router.push({ name: "Home" });
      
    });
    
  } else {
    setTimeout(function(){ 
      store.commit("setUser", null);
      store.commit("setMainLoading", false);
      router.push({ name: "Login" });
      
    }
    , 1000);
  }
});

