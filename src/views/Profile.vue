<template>
  <div class="profile">
    <h1>Welcome {{ user.firstName ? user.firstName + ' ' + user.lastName : ''  }}</h1>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({
  components: {}
})
export default class Profile extends Vue {
  get user() {
    return this.$store.getters.user;
  }
}
</script>
