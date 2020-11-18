import Vue from "vue";
import Vuex from "vuex";
import router from "../router";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: null,
    status: null,
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
    setSelectedChat(state, payload) {
      state.selectedChat = payload;
    },
    setMainLoading(state, payload) {
      state.mainLoading = payload;
    }
  },
  actions: {
    LOGIN_USER({commit}, payload) {
      //
    },
    REGISTER_USER({ commit }, payload) {
      commit("setStatus", "busy");
      commit("setUser", payload);
      commit("setStatus", "success");
      router.push("/");
        
    },
    LOGOUT_USER({ commit }) {
      commit("setStatus", "busy");
      commit("setUser", null);
      commit("setStatus", "success");
      router.push("/login");
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
    }
  },
  modules: {}
});
