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
import { Component, Watch } from "vue-property-decorator";

import NavBar from "@/components/NavBar.vue";

@Component({
  components: {
    NavBar
  }
})
export default class App extends Vue {

  appLoading = false;

  @Watch('$store.state.mainLoading')
  onAppLoaded(val: any) {
    this.appLoading = val; 
  }
}
</script>
<style lang="scss">

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
