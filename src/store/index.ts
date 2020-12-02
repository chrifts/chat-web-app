import { CONTACT_REQUEST, NEW_MESSAGE } from "@/constants";
import { axiosRequest } from "@/helpers";
import Vue from "vue";
import Vuex from "vuex";
import router from "../router";

Vue.use(Vuex);

interface Notifications { 
  [type: string]: { 
    [from: string]: any; 
  }; 
}
const notif: Notifications = { };

export default new Vuex.Store({
  state: {
    firstLoad: false,
    user: null,
    status: null,
    selectedChat: null,
    mainLoading: false,
    mainNotifications: notif,
    allContacts: [{
      status: String,
      lastMessage: String,
    }],
    mainAppSocketStatus: 'connecting...'
  },
  mutations: {
    readNotifications(state, payload) {
      const notifications = payload;
      Object.entries(notifications).forEach(([ix, el])=>{
          Object.entries((el as {})).forEach(([i, e])=>{ 
              (e as []).forEach(notf => {
                  (notf as any).status = 'read'
              });
          })
      })
      state.mainNotifications = notifications;
      state.mainNotifications = {...state.mainNotifications}
    },
    readChat(state, payload) {
      if(state.mainNotifications['new-message'] && state.mainNotifications['new-message'][payload]){
        delete state.mainNotifications['new-message'][payload]
        state.mainNotifications = {...state.mainNotifications}
      }
      
    },
    updateNotifications(state, payload){
      if(payload == 'logout') {
        state.mainNotifications = {};
        state.mainNotifications = {...state.mainNotifications}
        return;
      }
      console.log(payload);
      if(payload.notification) {
        state.allContacts.forEach((contact: any, index) => { 
          if(contact._id == payload.from) {
            //console.log(state.mainNotifications);
            if(state.mainNotifications[payload.type]) {
              state.mainNotifications[payload.type][contact._id] ? null : state.mainNotifications[payload.type][contact._id] = [];
              switch (payload.type) {
                case NEW_MESSAGE:
                  state.mainNotifications[payload.type][contact._id].push(payload)    
                  break;
                case CONTACT_REQUEST:
                  state.mainNotifications[payload.type][contact._id] = []  
                  state.mainNotifications[payload.type][contact._id].push(payload)
                  break;
                default:
                  break;
              }
              
              state.mainNotifications = {...state.mainNotifications}
            } else {
              state.mainNotifications[payload.type] = {}
              state.mainNotifications[payload.type][contact._id] = []
              switch (payload.type) {
                case NEW_MESSAGE:
                  state.mainNotifications[payload.type][contact._id].push(payload)    
                  break;
                case CONTACT_REQUEST:
                  state.mainNotifications[payload.type][contact._id] = []  
                state.mainNotifications[payload.type][contact._id].push(payload)
                  break;
                default:
                  break;
              }
              state.mainNotifications = {...state.mainNotifications}
            }
          }
        })
      }
      if(payload.notifications) {
        state.mainNotifications = payload.notifications; 
      }
    },
    updateContactLastMessage(state, payload) {
      console.log(payload);
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
      if(payload.extraDataFrom) {
        state.allContacts.push(payload.extraDataFrom)
      } else {
        state.allContacts.push(payload)
      }
      
    },
    updateContactStatus(state, payload) {
      //console.log(payload);
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
      //console.log(payload);
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
    SET_USER({commit}, payload) {
      
      commit('setUser', payload)
      if(payload.notifications) {
        this.dispatch('UPDATE_NOTIF', payload)
      }
    },
    UPDATE_NOTIF({commit}, payload) {
      commit('updateNotifications', payload)
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
      commit('updateNotifications', 'logout')
      commit("SOCKET_setContacts", []);
      commit("setStatus", "success");
      router.push("/login");
    }
  },
  getters: {
    mainNotifs(state) {
      return state.mainNotifications;
    },
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
