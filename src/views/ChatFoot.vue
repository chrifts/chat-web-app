<template>
    <div class="footer-block" >
        <div class="f1">
            <div class="textarea-div mb-3">
                <div tabindex="-1" class="textarea">
                    <!-- <div class="label" style="visibility: visible">Escribe un mensaje aquí</div> -->
                    <div 
                        @keyup="writing($event)"
                        id="texttype" 
                        class="writehere copyable-text selectable-text" 
                        contenteditable="true"
                        focusable
                        ref="_textarea"
                        data-tab="6" 
                        dir="ltr" 
                        spellcheck="true">
                    </div>
                </div>
            </div>
            <v-btn icon elevation="1" outlined @click="sendMessage()" class="mb-4 mr-2" style="position: relative; top: 1px;" >
                <v-icon>
                    mdi-send
                </v-icon>
            </v-btn>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Prop } from "vue-property-decorator";
import store from '@/store/index';
import * as firebase from "firebase";
import "firebase/database";
import { chatKey } from '../helpers';

interface NewMessage {
    timestamp: number,
    message: string,
    from: string,
    to: string
}

@Component({
})
export default class ChatFoot extends Vue {    
    @Prop() chatWindowProp: any;

    @Watch("chatWindowProp")
    onWindowChange(val: any): any {
        this.chatWindow = this.chatWindowProp;
    }

    chatWindow: boolean;
    chatSelected = this.selectedChat;
    messageText: string;
    newMessage: NewMessage;
    
    get mydata() {
        return this.$store.getters.user;
    }
    
    get selectedChat() {
        return this.$store.getters.selectedChat;
    }

    @Watch("$store.state.selectedChat")
    onChangedChat(val: any) {
        this.chatSelected = val;
    }
    
    writing(event: any) {   
        const input = event.target as HTMLElement;
        this.messageText = input.innerText;        
    }

    sendMessage() {
        // eslint-disable-next-line
        
        const theTextArea = this.$refs._textarea as HTMLElement;
        theTextArea.focus();
        const messageTime = Date.now();
        const newMessage = firebase.database().ref("chats/"+this.chatSelected.chatKey).push();
        this.newMessage = {
            timestamp: messageTime,
            message: this.messageText,
            from: this.mydata.uid,
            to: this.chatSelected.auth.uid
        }
        newMessage.set(this.newMessage);
        firebase.database().ref("users/"+this.chatSelected.auth.uid+'/contacts/'+this.mydata.uid+'/lastMessage').set(this.messageText);
        firebase.database().ref("users/"+this.mydata.uid+'/contacts/'+this.chatSelected.auth.uid+'/lastMessage').set(this.messageText);
        // eslint-disable-next-line
        theTextArea.innerText = '';
        return;

    }
}
</script>
