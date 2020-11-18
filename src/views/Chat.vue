<template>
  <v-container id="chat">
    <!-- DESKTOP -->
    <div class="main-content" v-if="!$vuetify.breakpoint.mobile">
      
      <Contacts @chatSelected="focusChat" />
      
      <v-col cols="8" style="padding: 0 !important">
        <div class="chat-main-view">
          <div v-if="!chatSelected">
            <span style="position: relative; top: 300px;">Choose a chat</span>
          </div>
          <h1 class="header-block" 
            v-if="chatSelected">{{ chatSelected.extraData.firstName + ' ' + chatSelected.extraData.lastName  }}
          </h1>
          <ChatList v-if="chatSelected" 
            :chatWindowProp="chatWindow"
          />
          <ChatFoot v-if="chatSelected"
            :chatWindowProp="chatWindow" 
          />
        </div>
      </v-col>
    </div>
    <!-- MOBILE -->
    <div class="main-content-mobile" v-else>
      <Contacts @chatSelected="focusChat" v-if="!chatSelected" />
      <v-col cols="12" v-if="chatSelected" style="padding: 0 !important">
        <div class="chat-main-view">
          
          <div class="header-block" v-if="chatSelected">
            <v-row>
              <v-col cols=2>
                <v-btn outlined elevation="1" color="white" icon @click="unsetSelectedChat()"> 
                  <v-icon color="white">
                    mdi-chevron-left
                  </v-icon> 
                </v-btn>
              </v-col>
              <v-col cols=10>
                <h3 class="text-left mt-1">{{ chatSelected.extraData.firstName + ' ' + chatSelected.extraData.lastName  }}</h3>
              </v-col>
            </v-row>
            
            
          </div>
          <ChatList v-if="chatSelected" 
            :chatWindowProp="chatWindow"
          />
          <ChatFoot v-if="chatSelected"
            :chatWindowProp="chatWindow" 
          />
        </div>
      </v-col>
    </div>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";

import Contacts from "./chatContent/Contacts.vue";
import ChatList from "./ChatList.vue";
import ChatFoot from "./ChatFoot.vue";
import VueScrollTo from 'vue-scrollto';
import { chatKey } from '../helpers';
import store from '@/store/index'
Vue.use(VueScrollTo)

@Component({
  components: {
    Contacts,
    ChatList,
    ChatFoot
  }
})
export default class Chat extends Vue {
  chatSelected: any | boolean = false;
  chatWindow = false;
  
  messageText: string;
  loading = false;
  scrollOpts = {
    container: '.chat-list-block',
    element: '.bubble:last-child',
    easing: 'ease-in',
    lazy: false,
    offset: 0,
    force: true,
    cancelable: true,
    x: false,
    y: true
  }

  get mydata() {
    return this.$store.getters.user;
  }

  focusChat(contact: any) {
    this.chatWindow = true;
    this.chatSelected = contact;
    this.chatSelected.chatKey = chatKey(this.mydata._id, contact.auth._id);
    store.commit('setSelectedChat', this.chatSelected);
  }

  @Watch('$store.state.selectedChat')
  onChangeChat(val: any) {
    this.chatSelected = val;
  }

  scrollBottom() {
    this.$scrollTo('.bubble:last-child', 300, this.scrollOpts)
  }

  unsetSelectedChat() {
    this.chatWindow = false;
    this.chatSelected = false;
    store.commit('setSelectedChat', false);
  }

}
</script>

<style lang="scss">

.textarea-div {
  padding: 8px 10px;
  flex: 1 1 auto;
  box-sizing: border-box;
  width: inherit;
  min-width: 0;
  min-height: 20px;
  font-weight: 400;
  font-size: 15px;
  line-height: 20px;
  outline: none;
  will-change: width;
  .textarea {
    position: relative;
    display: flex;
    flex: 1;
    overflow: hidden;
    cursor: text;
    .label {
      position: absolute;
      top: 2px;
      z-index: 100;
      z-index: 2;
      color: var(--input-placeholder);
      font-size: 15px;
      line-height: 20px;
      transition: opacity .08s linear;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      pointer-events: none;
    }
    .writehere {
      background-color: white;
      text-align: left;
      width: 100%;
      border-radius: 6px;
      position: relative;
      z-index: 1;
      min-height: 25px;
      max-height: 100px;
      overflow-x: hidden;
      overflow-y: auto;
      color: var(--compose-primary);
      font-weight: 400;
      font-size: 15px;
      white-space: pre-wrap;
      word-wrap: break-word;
      outline: none;
    }
  }
}

#chat {
    position: relative;
    z-index: 100;
    width: 100%;
    height: 100%;
    overflow: hidden;
}
.main-content {
  position: relative;
  top: 0;
  display: flex;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  height: 100%;
  overflow: hidden;
  box-shadow: 0 4px 9px 0 rgba(0, 0, 0, 0.5), 0 7px 4px 0 rgba(70, 70, 70, 0.2);
}
.main-content-mobile {
  position: relative;
  top: 0;
  display: flex;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  height: 100%;
  overflow: hidden;
  .header-block {
    background-color: $main_1;
    color: white;
  }
}
.chat-main-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: background-color .3s;
}
.header-block {
  box-shadow: 0pt 0pt 9pt 0pt #b8b8b8;
  z-index: 1;
  background-color: #fff;
  height: 72px;
  color: rgb(59, 59, 59);
  padding: 10px;
  position: relative;
  display: flex;
  order: 1;
}
.chat-list-block {
  background: radial-gradient(white, rgb(230, 230, 230));
  overflow-y: scroll;
  position: relative;
  display: block;
  order: 2;
  flex: 1 1 0;

}


</style>
