<template>
  <div>
    <!-- DESKTOP -->
    <v-toolbar color="primary" v-if="!$vuetify.breakpoint.mobile">
      <v-toolbar-title>
        <v-btn color="white" text :to="'/'">
          {{appName}}
        </v-btn>
        <v-badge
          
          inline
          dot
          v-if="loggedIn && mainSocketStatus && !loading"
          :color="mainSocketStatus == 'connected' ? 'green' : 'red'"
        >
          <span class="text-subtitle-1 text--disabled" title='Main socket status'>
            {{mainSocketStatus}}  
          </span>
        </v-badge>
        
        
      </v-toolbar-title>
      
      <v-spacer></v-spacer>
      
        <v-toolbar-items v-if="!loggedIn && !loading">
          <v-btn
            color="white"
            text
            v-for="item in itemsNoAuth"
            :key="item.title"
            :to="item.link"
          >
            {{ item.title }}
            <v-icon right color="white">{{ item.icon }}</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
        </v-toolbar-items>

        <v-toolbar-items v-if="loggedIn && !loading">

          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              

              
              <v-btn
                @click="hasNotifications = false"
                color="white"
                icon
                v-bind="attrs"
                v-on="on"
              >
                <v-badge
                  color="red"
                  overlap
                  :content="totalNotifications"
                  :value="hasNotifications"
                >
                  
                  <v-icon>mdi-bell</v-icon>
                </v-badge>
              </v-btn>
              
            </template>
            <v-list class="not-list" v-if="Object.keys(mainNotifications).length > 0">
              <!-- loop notification type -->
              <v-list-item
                v-for="(data, notifType) in mainNotifications"
                :key="notifType"
                :class="{'d-none': Object.keys(data).length < 1}"
              >
                
                  <span >{{parseNotificationType(notifType)}}</span>
                  <v-list class="not-list">
                    <!-- Loop users -->
                    <v-list-item
                      v-for="(el, ix) in data"
                      :key="ix"
                    >
                      <v-list-item-title v-if="notifType == 'new-message'">{{ el.length }} {{el.length > 1 ? 'messages' : 'message'}} from </v-list-item-title>
                      <v-list-item-title v-if="notifType == 'contact-request'"> 
                        <!-- <span v-if="el[0].message.status == 'connecteds'"> accepted from</span> -->
                        {{el[0].message.status}} 
                      </v-list-item-title>
                      <v-list-item-subtitle>{{ el[0].extraDataFrom.email }}</v-list-item-subtitle>                    
                    </v-list-item>
                  </v-list>
                
                
              </v-list-item>
            </v-list>
          </v-menu>
          
          <v-btn color="white" text v-for="item in itemsAuth" :key="item.title" :to="item.link">
            {{ item.title }}
            <v-icon right color="white">{{ item.icon }}</v-icon>
          </v-btn>
          <v-spacer></v-spacer>

          <v-btn text color="white" @click="logout">
            Logout
            <v-icon color="white" right>exit_to_app</v-icon>
          </v-btn>
        </v-toolbar-items>
    
      
    </v-toolbar>
    <div v-if="mainLoading">
      <v-progress-linear
        height="8"
        v-if="mainLoading"
        indeterminate
        color="red darken-2"
      ></v-progress-linear>
      Loading...
    </div>
    <!-- MOBILE -->
    <v-bottom-navigation v-if="$vuetify.breakpoint.mobile && !chatSelected" class="bottom-nav content-between" :class="{'bottom-nav-no-chat' : $router.currentRoute.name != 'Chat'}">
      <v-btn text v-for="item in itemsAuth" :key="item.title" :to="item.link">
        <span>{{ item.title }}</span>
        <v-icon center>{{ item.icon }}</v-icon>
      </v-btn>
    </v-bottom-navigation>
    <span>{{loggedIn ? loggedIn.email : ''}}</span>
    
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import store from '@/store/index'
import { Watch, Prop, Model } from 'vue-property-decorator';
import { axiosRequest } from '../helpers';

@Component({})
export default class NavBar extends Vue {

  @Model('change') socketStatus!: string;
  @Watch('$store.state.mainAppSocketStatus')
    onSocketStatusChange(ss: any) {
        this.mainSocketStatus = ss;
    }

  mainSocketStatus = this.mainAppSocketStatus;
  chatSelected = this.selectedChat;
  loading = false;
  loggedIn = this.userLoggedIn;
  appName = process.env.VUE_APP_NAME;
  mainNotifications = this.mainNotif;
  readed = false;
  hasNotifications = false;
  totalNotifications = 0;

  get itemsNoAuth() {
    const menuItems = [
      {
        title: "Register",
        icon: "add",
        link: "/register"
      },
      {
        title: "Login",
        icon: "send",
        link: "/login"
      }
    ];
    return menuItems;
  }
  setTotalNotif(q) {
    this.totalNotifications+=q;
  }
  get itemsAuth() {
    const menuItems = [
      {
        title: "Home",
        icon: "home",
        link: "/"
      },
      {
        title: "Chat",
        icon: "message",
        link: "/chat"
      },
      {
        title: "Profile",
        icon: "mdi-account",
        link: "/profile"
      },
    ];
    return menuItems;
  }

  get mainNotif() {
    return this.$store.getters.mainNotifs
  }
  get mainLoading() {
    return this.$store.getters.mainLoading;
  }

  get mainAppSocketStatus() {
    return this.$store.getters.mainAppSocketStatus;
  }

  get userLoggedIn() {
    return this.$store.getters.user;
  }

  get selectedChat() {
    return this.$store.getters.selectedChat;
  }

  parseNotificationType(data) {
    let type;
    switch (data) {
      case 'new-message':
        type = 'New message'
        break;
      case 'contact-request':
        type = 'Contact request'
        break;
      default:
        break;
    }
    return type;
  }


  public logout() {
    axiosRequest('POST', (this.$root as any).urlApi + '/auth/logout', {refreshToken: this.$cookies.get('refreshToken')} )
    store.commit("setMainLoading", true);
    this.$socket.client.disconnect();
    this.$store.dispatch("LOGOUT_USER");
    this.$cookies.remove('jwt');
    this.$cookies.remove('refreshToken');
  }
  @Watch('$store.state.mainLoading')
  onMainLoading(val: any) {
    this.loading = val;
  }

  // mounted(){

  // }

  @Watch('$store.state.mainNotifications', { deep : true, immediate: true })
  onMainNotificationsChange(val: any) {
    let totalN = 0;
    Object.entries(val).forEach(([type, contacts])=> {
      if(Object.keys(contacts as {}).length > 0) {
        Object.entries(contacts as {}).forEach(([ix, contact])=> {
          totalN += (contact as []).length;
        })
        this.hasNotifications = true;
        this.totalNotifications = totalN;
      } 
    })
    
    this.mainNotifications = val;
    console.log(this.mainNotifications);
  }

  @Watch('$store.state.user')
  onUser(val: any) {
    this.loggedIn = val;
  }
  @Watch('$store.state.selectedChat')
  onChangeChat(val: any) {    
    this.chatSelected = val;
  }
}
</script>

<style lang="scss">
.v-badge--dot .v-badge__badge {
  margin-bottom: 3px !important;
}
.not-list {
  width: 100%;
}
.bottom-nav {
  z-index: 2;
}
.content-between {
  justify-content: space-between !important;
}

</style>
