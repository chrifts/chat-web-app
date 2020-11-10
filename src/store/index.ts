import Vue from "vue";
import Vuex from "vuex";
import * as firebase from "firebase";
import router from "../router";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: null,
    userContacts: [] as string[],
    status: null,
    firebaseError: null,
    selectedChat: null,
    mainLoading: false,
  },
  mutations: {
    setUser(state, payload) {
      state.user = payload;
    },
    setStatus(state, payload) {
      state.status = payload;
    },
    setFirebaseError(state, payload) {
      state.firebaseError = payload;
    },
    setUserContacts(state, payload) {
      state.userContacts.push(payload);
    },
    setSelectedChat(state, payload) {
      state.selectedChat = payload;
    },
    setMainLoading(state, payload) {
      state.mainLoading = payload;
    }
  },
  actions: {
    REGISTER_USER({ commit }, payload) {
      commit("setStatus", "busy");
      firebase
        .auth()
        .createUserWithEmailAndPassword(payload.email, payload.password)
        .then(response => {
          commit("setUser", response.user);
          commit("setStatus", "success");
          commit("setFirebaseError", null);
          router.push("/");
        })
        .catch(error => {
          commit("setStatus", "failure");
          commit("setFirebaseError", error.message);
        });
    },
    LOGIN_USER({ commit }, payload) {
      commit("setStatus", "busy");
      firebase
        .auth()
        .signInWithEmailAndPassword(payload.email, payload.password)
        .then(response => {
          commit("setUser", response.user);
          commit("setStatus", "success");
          commit("setFirebaseError", null);
          router.push("/");
        })
        .catch(error => {
          commit("setStatus", "failure");
          commit("setFirebaseError", error.message);
        });
    },
    LOGOUT_USER({ commit }) {
      commit("setStatus", "busy");
      firebase
        .auth()
        .signOut()
        .then(response => {
          commit("setUser", null);
          commit("setStatus", "success");
          commit("setFirebaseError", null);
          router.push("/login");
        })
        .catch(error => {
          commit("setStatus", "failure");
          commit("setFirebaseError", error.message);
        });
    }
  },
  getters: {
    selectedChat(state) {
      return state.selectedChat;
    },
    mainLoading(state) {
      return state.mainLoading
    },
    status(state) {
      return state.status;
    },
    user(state) {
      return state.user;
    },
    userContacts(state) {
      return state.userContacts;
    },
    firebaseError(state) {
      return state.firebaseError;
    }
  },
  modules: {}
});
