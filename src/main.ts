import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
// import * as firebase from "firebase/app";
// import "firebase/auth";
// import "firebase/firestore";
import vuetify from "./plugins/vuetify";
import dotenv from 'dotenv';
import { axiosRequest } from './helpers/index'
import VueCookies from "vue-cookies-ts"
Vue.use(VueCookies)

dotenv.config();

//GET CONFIG VALUE FROM ENV FILE
// const firebaseConfig = {
//   apiKey: process.env.VUE_APP_FIREBASE_CONFIG_apiKey,
//   authDomain: process.env.VUE_APP_FIREBASE_CONFIG_authDomain,
//   databaseURL: process.env.VUE_APP_FIREBASE_CONFIG_databaseURL,
//   projectId: process.env.VUE_APP_FIREBASE_CONFIG_projectId,
//   storageBucket: process.env.VUE_APP_FIREBASE_CONFIG_storageBucket,
//   messagingSenderId: process.env.VUE_APP_FIREBASE_CONFIG_messagingSenderId,
//   appId: process.env.VUE_APP_FIREBASE_CONFIG_appId,
//   measurementId: process.env.VUE_APP_FIREBASE_CONFIG_measurementId
// };
// Initialize Firebase
// firebase.initializeApp(firebaseConfig);

let app: any;
const urlApi: string = process.env.NODE_ENV == 'development' ? process.env.VUE_APP_API! : process.env.VUE_APP_API_PROD!;
const init = () => {
  if (!app) {
    app = new Vue({
      router,
      store,
      vuetify,
      components: {
        App,
      },
      data: ()=>({
        urlApi: urlApi,
        user: {},
      }),
      beforeCreate: async function () {
        store.commit("setMainLoading", true);
        const sessionToken = this.$cookies.get('jwt');
        const refreshToken = this.$cookies.get('refreshToken')
        if(sessionToken) {
          const user = await axiosRequest('POST', urlApi + '/get-user', {}, {headers: {"x-auth-token": sessionToken}})
          console.log(user);
          if(user.data.email) {
            store.commit("setUser", user.data);
            store.commit("setMainLoading", false);
            return;
          }
          if(user.data.message == 'Session timed out,please login again') {
            const _refreshToken = await axiosRequest('POST', urlApi + '/auth/refresh_token', {refreshToken: refreshToken})
            console.log(_refreshToken);
            if (_refreshToken.data.message == 'jwt expired' || _refreshToken.data.error == 'Token expired!') {
              axiosRequest('POST', (this.$root as any).urlApi + '/auth/logout', {refreshToken: refreshToken} )
              this.$store.dispatch("LOGOUT_USER");
              this.$cookies.remove('jwt');
              this.$cookies.remove('refreshToken');
              store.commit("setUser", null);
              store.commit("setMainLoading", false);
              return;
            } else {
              //refresh cookie access token
              this.$cookies.set('jwt', _refreshToken.data.accessToken)
              store.commit("setMainLoading", false);
              location.reload();
              return;
            }
          }
        } else {
          store.commit("setUser", null);
          store.commit("setMainLoading", false);
        }

      },
      watch: {
        '$store.state.user': function(user) {
          if(user) {
            console.log(user);
            store.commit("setUser", user);
            store.commit("setMainLoading", false);
            router.push({ name: "Home" });
          } else {
            store.commit("setUser", null);
            store.commit("setMainLoading", false);
            router.push({ name: "Login" });
          }
          
        }
      },
      render: function (createElement) {
        return createElement('App');
      }
    }).$mount("#app");
  }
};    
init();