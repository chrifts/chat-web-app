<template>
  <v-container id="chat">
    <div class="main-content">
      
      <Contacts @chatSelected="loadChat" />
      
      <v-col cols="8" style="padding: 0 !important">
        <div class="chat-main-view">
          <div v-if="!chatSelected">
            <span style="position: relative; top: 300px;">Choose one chat</span>
          </div>
          <h1 class="header-block" v-if="chatSelected">{{ chatSelected.extraData.firstName + ' ' + chatSelected.extraData.lastName  }}</h1>
          <div class="chat-list-block px-3" >
            
            <v-progress-circular
              v-if="chatSelected && !messages"
              indeterminate
              color="primary"
            ></v-progress-circular>
            <v-col cols=12 :style="messages ? 'visibility: visible' : 'visibility: hidden'">
              <v-list :class="{'d-block' : chatWindow}" class="d-none" >
                <template v-for="(item, index) in messages">
                  <v-list-item 
                    two-line 
                    :key="index"
                  >
                    <v-list-item-content>
                      <v-list-item-title>{{item.message}}</v-list-item-title>
                      <v-list-item-subtitle>{{item.timestamp}}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </v-list>
            </v-col>
          </div>
          <div class="footer-block" :style="chatSelected ? 'visibility: visible' : 'visibility: hidden'">
            <div class="f1">
              <div class="textarea-div mb-2">
                <div tabindex="-1" class="textarea">
                  <!-- <div class="label" style="visibility: visible">Escribe un mensaje aquí</div> -->
                  <div id="texttype" class="writehere copyable-text selectable-text" contenteditable="true" data-tab="6" dir="ltr" spellcheck="true"></div>
                </div>
              </div>
              <v-btn @click="sendMessage()" class="mb-4 mr-2" style="height: 25px">send</v-btn>
            </div>
          </div>
        </div>
      </v-col>
    </div>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import * as firebase from "firebase";
import "firebase/database";
import Contacts from "./chatContent/Contacts.vue";

interface NewMessage {
    timestamp: number,
    message: string,
    from: string,
    to: string
}

@Component({
  components: {
    Contacts
  }
})
export default class Chat extends Vue {
  chatSelected: any | boolean = false;
  chatWindow = false;
  messages: any | boolean = false;
  newMessage: NewMessage;
  messageText: string;
  loading = false;

  get mydata() {
    return this.$store.getters.user;
  }

  setTextAreaEvent() {
    console.log('seted');
    document.getElementById('texttype')!.addEventListener('keyup', (event) => {
      const input = event.target as HTMLElement;
      this.messageText = input.innerText;
    }, false);
  }

  loadChat(contact: any) {
    this.chatSelected = contact;
    this.chatWindow = true;
    const myuid = this.mydata.uid
    if(myuid < contact.auth.uid){
      this.chatSelected.chatKey = myuid+contact.auth.uid;  
    }
    else{
      this.chatSelected.chatKey = contact.auth.uid+myuid;
    }
    try {
      const ref = firebase.database().ref("chats/"+this.chatSelected.chatKey);
      ref.once("value").then((snapshot) => {
        if(!snapshot.exists()) {
          this.sendMessage(true)
          
          firebase.database().ref("chats/"+this.chatSelected.chatKey).on("value", (snapshot) => {
            this.messages = snapshot.val();
            
          })
        } else {
          //load chatKey data
          
          firebase.database().ref("chats/"+this.chatSelected.chatKey).on("value", (snapshot) => {
            this.messages = snapshot.val();
            
          })
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  mounted() {
    this.setTextAreaEvent();
  }

  sendMessage(isFirst: boolean) {
    const messageTime = Date.now();
    if(isFirst) {
      const newChat = firebase.database().ref("chats/"+this.chatSelected.chatKey).push()
      this.newMessage = {
        timestamp: messageTime,
        message: "Here start the chat",
        from: 'server-first-message',
        to: 'all'
      }
      newChat.set(this.newMessage);
      return;
    }
    const newMessage = firebase.database().ref("chats/"+this.chatSelected.chatKey).push()
    this.newMessage = {
      timestamp: messageTime,
      message: this.messageText,
      from: this.mydata.uid,
      to: this.chatSelected.auth.uid
    }
    newMessage.set(this.newMessage);
    firebase.database().ref("users/"+this.chatSelected.auth.uid+'/contacts/'+this.mydata.uid+'/lastMessage').set(this.messageText);
    return;
  }

  get user() {
    return this.$store.getters.user;
  }
}


</script>
<style lang="scss">
$chat-theme: #ececec;

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
      top: 6px;
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
.chat-main-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: background-color .3s;
}
.header-block {
  background-color: $chat-theme;
  padding: 10px;
  position: relative;
  display: flex;
  order: 1;
}
.chat-list-block {
  position: relative;
  display: block;
  order: 2;
  flex: 1 1 0;
}
.footer-block{
  background-color: $chat-theme;
  position: relative;
  z-index: 1;
  flex: none;
  order: 3;
  box-sizing: border-box;
  width: 100%;
  min-height: 62px;
  .f1 {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    box-sizing: border-box;
    max-width: 100%;
    min-height: 62px;
  }
}
</style>
