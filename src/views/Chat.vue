<template>
  <v-container>
    <v-row>
      <v-col md="4">
        <Contacts />
      </v-col>
      <v-col md="8">
        <h1>CHAT DE:</h1>
        <h1>{{ user.firstName }}</h1>
        <h1>{{ user.email }}</h1>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import * as firebase from "firebase";
import "firebase/database";
import Contacts from "./chatContent/Contacts.vue";

@Component({
  components: {
    Contacts
  }
})
export default class Chat extends Vue {
  created() {
    const starCountRef = firebase.database().ref("users/");

    starCountRef.on("value", function(snapshot) {
      // console.log(snapshot.val());
    });
  }

  get user() {
    return this.$store.getters.user;
  }

}
</script>
