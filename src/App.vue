<template>
  <div id="app">
    <v-app :class="{'mobile-container' : $vuetify.breakpoint.mobile}">
      <NavBar v-if="!$vuetify.breakpoint.mobile"  style="z-index: 1;" />
      <router-view />
      <NavBar v-if="$vuetify.breakpoint.mobile" style="z-index: 1;" />
    </v-app>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Watch } from "vue-property-decorator";
import Component from "vue-class-component";
import NavBar from "@/components/NavBar.vue";
//main socket connection
import VueSocketIOExt, { Socket } from 'vue-socket.io-extended'
import { io } from 'socket.io-client';
import { axiosRequest } from './helpers';

@Component({
  components: {
    NavBar
  }
})
export default class App extends Vue {

  theUser = this.$store.getters.user;

  appLoading = false;

  @Watch('$store.state.user')
  onUser(val: any) {
    if(val) {
      this.theUser = val;
    }
  }

  async mounted() {
    this.appLoading = true;
    const sessionToken = this.$cookies.get('jwt'); 
    const user = await axiosRequest('POST', (this.$root as any).urlApi + '/get-user', {}, {headers: {"x-auth-token": sessionToken}})
    if(user.data.email){
      const fullUser = await axiosRequest('POST', (this.$root as any).urlApi + '/get-user', {getFull: true, email: user.data.email}, {headers: {"x-auth-token": sessionToken}})
      this.theUser = fullUser.data;
      this.$store.commit('setUser', fullUser.data);
      const socket = io('http://localhost:3000/'+fullUser.data._id);
      Vue.use(VueSocketIOExt, socket);
      console.log(this.theUser)

      this.$socket.client.emit('USER_LOGGED', user.data)
      this.appLoading = false;

      // VERIFY THAT .on DONT EXECUTE DUPLICATED TIMES
      this.$socket.client.on('CONTACT_REQUEST', payload => {
        console.log(payload)
      });
    }
  }

  // ONLY WORK ON CHILDS OF APP.VUE
  // @Socket('CONTACT_REQUEST')
  // onContactRequest(val: any) {
  //   console.log(val);
  // }

  @Watch('$store.state.mainLoading')
  onAppLoaded(val: any) {
    this.appLoading = val; 
  }
}
</script>
<style lang="scss">
.v-application--wrap {
  background: linear-gradient(rgb(245, 245, 245), rgb(218, 218, 218));
}
.mobile-container {
  .v-application--wrap {
    #main-view {
      height: 100%;
    }
    #chat {
      padding: 0 !important;
    }
    padding-bottom: 75px !important;
    z-index: 0;
  }
}
#app {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  padding: 0;
  margin: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
