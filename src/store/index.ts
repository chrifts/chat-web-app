import { axiosRequest } from "@/helpers";
import Vue from "vue";
import Vuex from "vuex";
import router from "../router";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    firstLoad: false,
    user: null,
    status: null,
    selectedChat: null,
    mainLoading: false,
    mainNotifications: {},
    allContacts: [{
      status: String,
      lastMessage: String,
    }],
    mainAppSocketStatus: 'connecting...'
  },
  mutations: {
    updateNotifications(state, payload){
      if(payload.notification) {
        switch (payload.notification.type) {
          case 'new-message':
            console.log('new message case', payload)             
            state.allContacts.forEach((contact: any, index) => { 
              if(contact._id == payload.from) {
                if(state.mainNotifications[payload.notification.type]) {
                  state.mainNotifications[payload.notification.type][contact._id].push({from: contact, data: payload})
                  state.mainNotifications = {...state.mainNotifications}
                } else {
                  state.mainNotifications[payload.notification.type] = {}
                  state.mainNotifications[payload.notification.type][contact._id] = []
                  state.mainNotifications[payload.notification.type][contact._id].push({from: contact, data: payload})
                  state.mainNotifications = {...state.mainNotifications}
                }
                
              }
            })
            break;
        
          default:
            break;
        }
        
      }
    },
    updateContactLastMessage(state, payload) {
      console.log(payload)
      state.allContacts.forEach((contact: any, index) => {
        if(contact._id == payload.to || contact._id == payload.from) {
          state.allContacts[index].lastMessage = payload
          
          state.allContacts = [...state.allContacts];
        }
      })
    },
    setMainAppSocketStatus(state, payload) {
      state.mainAppSocketStatus = payload;
    },
    setFirstLoad(state, payload) {
      state.firstLoad = payload
    },
    SOCKET_setContacts(state, payload) {
      state.allContacts = payload;
    },
    addContact(state, payload) {
      state.allContacts.push(payload)
    },
    updateContactStatus(state, payload) {
      console.log(payload);
      switch (payload.event) {
        case 'ACCEPTED':
          state.allContacts.forEach((contact: any, index) => {
            if(contact._id == payload.contactId) {
              state.allContacts[index].status = payload.status
            }
          })
          break;
        case 'RESEND':
          state.allContacts.forEach((contact: any, index) => {
            if(contact._id == payload.contactId) {
              state.allContacts[index].status = payload.status
            }
          })
          break;
        case 'REJECTED':
          state.allContacts.forEach((contact: any, index) => {
            if(contact._id == payload.contactId) {
              state.allContacts[index].status = payload.status
            }
          })
          break;
        default:
          break;
      }
    },
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
    async GET_CONTACTS({commit}, payload) {
      const res = await axiosRequest('POST', process.env.VUE_APP_API + '/user/get-contacts', {email: payload.user.email}, {headers: {"x-auth-token": payload.jwtKey}})
      commit('SOCKET_setContacts', res.data.contacts)
    },
    REGISTER_USER({ commit }, payload) {
      commit("setStatus", "busy");
      commit("setUser", payload);
      commit("setStatus", "success");
      router.push("/");
        
    },
    LOGOUT_USER({ commit }) {
      commit('setFirstLoad', false);
      commit("setStatus", "busy");
      commit("setUser", null);
      console.log('empty contacts')
      commit("SOCKET_setContacts", []);
      commit("setStatus", "success");
      router.push("/login");
    }
  },
  getters: {
    mainAppSocketStatus(state) {
      return state.mainAppSocketStatus;
    },
    firstLoad(state) {
      return state.firstLoad
    },
    allContacts(state) {
      return state.allContacts;
    },
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
