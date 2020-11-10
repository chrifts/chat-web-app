<template>
  <div>
    <v-toolbar color="primary" v-if="!$vuetify.breakpoint.mobile">
      <v-toolbar-title>
        <v-btn text :to="'/'">
          APP NAME
        </v-btn>
      </v-toolbar-title>
      
      <v-spacer></v-spacer>
      
        <v-toolbar-items v-if="!loggedIn && !loading">
          <v-btn
            text
            v-for="item in itemsNoAuth"
            :key="item.title"
            :to="item.link"
          >
            {{ item.title }}
            <v-icon right>{{ item.icon }}</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
        </v-toolbar-items>

        <v-toolbar-items v-if="loggedIn && !loading">
          <v-btn text v-for="item in itemsAuth" :key="item.title" :to="item.link">
            {{ item.title }}
            <v-icon right>{{ item.icon }}</v-icon>
          </v-btn>
          <v-spacer></v-spacer>

          <v-btn text @click="logout">
            Logout
            <v-icon right>exit_to_app</v-icon>
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
    <v-bottom-navigation v-if="$vuetify.breakpoint.mobile && !chatSelected" class="bottom-nav content-between" :class="{'bottom-nav-no-chat' : $router.currentRoute.name != 'Chat'}">
      <v-btn text v-for="item in itemsAuth" :key="item.title" :to="item.link">
        <span>{{ item.title }}</span>
        <v-icon center>{{ item.icon }}</v-icon>
      </v-btn>
    </v-bottom-navigation>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import store from '@/store/index'
import { Watch, Prop } from 'vue-property-decorator';

@Component({})
export default class NavBar extends Vue {

  chatSelected = this.selectedChat;
  loading = true;
  loggedIn = this.userLoggedIn;

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
      }
    ];
    return menuItems;
  }

  get mainLoading() {
    return this.$store.getters.mainLoading;
  }

  get userLoggedIn() {
    return this.$store.getters.user;
  }

  

  get selectedChat() {
    return this.$store.getters.selectedChat;
  }

  public logout() {
    store.commit("setMainLoading", true);
    this.$store.dispatch("LOGOUT_USER");
  }
  @Watch('$store.state.mainLoading')
  onMainLoading(val: any) {
    
    this.loading = val;
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

<style lang="scss" scoped>
.bottom-nav {
  
  z-index: 2;
}
.content-between {
  justify-content: space-between !important;
}

</style>
