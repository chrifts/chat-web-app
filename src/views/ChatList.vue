<template>
    <div class="chat-list-block px-3" id="chat-list"> 
        <v-progress-circular
            v-if="chatSelected && !messages"
            indeterminate
            color="primary"
        ></v-progress-circular>
        <v-col cols=12 :style="messages ? 'visibility: visible' : 'visibility: hidden'">
            <v-list :class="{'d-block' : chatWindow}" class="d-none" id="the-list">
            <template v-for="(item, index) in messages">
                <v-list-item 
                two-line 
                :key="index"
                class="bubble-left bubble"
                :class="{'bubble-right': item.from == mydata.uid}"
                >
                <v-list-item-content >
                    {{item.message}}
                    <v-list-item-subtitle
                    class="text-left"
                    :class="{'text-right': item.from == mydata.uid}"
                    >{{item.timestamp}}</v-list-item-subtitle>
                </v-list-item-content>
                </v-list-item>
            </template>
            </v-list>
        </v-col>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Prop } from "vue-property-decorator";
import * as firebase from "firebase";
import "firebase/database";
import { chatKey } from '../helpers';

import VueScrollTo from 'vue-scrollto';
Vue.use(VueScrollTo)


@Component({
})
export default class ChatList extends Vue {

    @Prop() chatWindowProp: any;

    scrollOpts = {
        container: '.chat-list-block',
        element: '.bubble:last-child',
        easing: 'ease-in',
        lazy: false,
        offset: -60,
        force: true,
        cancelable: true,
        x: false,
        y: true
    }
    messages: any | boolean = false;
    chatSelected = this.selectedChat;
    chatWindow = this.chatWindowProp;
    messageText: string;
    
    get mydata() {
        return this.$store.getters.user;
    }

    get selectedChat() {
        return this.$store.getters.selectedChat;
    }

    scrollBottom() {
        this.$scrollTo('.bubble:last-child', 0, this.scrollOpts)
    }
    mounted() {
        this.loadChat();
    }

    loadChat() {
        try {
            const ref = firebase.database().ref("chats/"+this.chatSelected.chatKey);
            ref.once("value").then((snapshot) => {
                if(!snapshot.exists()) {
                    const newChat = firebase.database().ref("chats/"+this.chatSelected.chatKey).push()
                    const initialMessage = {
                        timestamp: Date.now(),
                        message: "Here start the chat",
                        chatKey: this.chatSelected.chatKey,
                        from: 'server-first-message',
                        to: 'all'
                    }
                    newChat.set(initialMessage);
                    firebase.database().ref("chats/"+this.chatSelected.chatKey).once("value", (snapshot) => {
                        const { [Object.keys(snapshot.val()) as any]: firstMessage } = snapshot.val();
                        if(this.chatSelected.chatKey == firstMessage.chatKey) {
                            this.messages = snapshot.val();
                            this.loadChat();
                        }
                    })
                } else {
                    firebase.database().ref("chats/"+this.chatSelected.chatKey).on("value", (snapshot) => {
                        const { [Object.keys(snapshot.val()).pop() as any]: lastItem } = snapshot.val();
                        if(lastItem.from == this.chatSelected.auth.uid || lastItem.to == this.chatSelected.auth.uid) {
                            this.messages = snapshot.val();
                        }
                        
                    })
                }
            })
        } catch (error) {
            throw new Error(error)
        }
    }

    @Watch("chatWindowProp")
    onWindowChange(val: any): any {
        this.chatWindow = this.chatWindowProp;
    }

    @Watch("$store.state.selectedChat")
    onChangedChat(val: any) {
        this.chatSelected = val;
        this.loadChat();
    }

    @Watch("messages")
    onMessagesChange(val: any): any {
        if(this.messages) {
            this.$nextTick().then(() => {
                this.scrollBottom();
            })
        }
    }
}
</script>
