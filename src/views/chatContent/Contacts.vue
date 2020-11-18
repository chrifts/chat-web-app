<template>
    <v-col :cols="$vuetify.breakpoint.mobile ? 12 : 4" class="col-contacts">
      <v-row class="bg-header">
        <v-col cols=12>
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-header>
                <template v-slot:default="{ open }">
                  <v-row no-gutters>
                    <v-col cols="12" class="">
                      <v-fade-transition leave-absolute>
                        <span v-if="open" key="0">
                          Add contact
                        </span>
                        <span v-else key="1" class="text--white">
                          Contacts
                        </span>
                      </v-fade-transition>
                    </v-col>
                  </v-row>
                </template>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-text-field
                  v-on:keyup="defineContactEmail($event.target.value)"
                  placeholder="email"
                ></v-text-field>
                <v-btn v-if="!addingContact" @click="addContact(newContactEmail)">Add</v-btn>
                <v-progress-circular
                  v-if="addingContact"
                  indeterminate
                  color="primary"
                ></v-progress-circular>
                <v-alert
                  v-model="alert"
                  border="left"
                  dismissible
                  :color="addContactResponseMessage == 'Success' ? 'green lighten-2' : 'red lighten-2' "
                > 
                  {{ addContactResponseMessage }}
                </v-alert>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols=12 style="padding: 0">
          <v-list three-line>
            <template v-for="(item, index) in allContacts">
              <v-list-item
                :key="index"
                v-on="item.connecteds ? { click: () => selectChat(item) } : {}"
              >
                <v-list-item-avatar>
                  <v-img :src="'https://cdn.vuetifyjs.com/images/lists/1.jpg'"></v-img>
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title
                    :class="{'red lighten-5': !item.auth, 'green lighten-5' : item.requestedBy == mydata._id && !item.connecteds, '': item.connecteds}"
                    v-html="item.extraData.firstName + ' ' +item.extraData.lastName"
                  >
                  </v-list-item-title>
                  
                  <v-list-item-subtitle v-if="item.requestedBy == mydata._id && !item.connecteds"> Contact request pending </v-list-item-subtitle>
                  <div v-else-if="item.connecteds == 'rejected'">
                    <v-list-item-subtitle > Request rejected </v-list-item-subtitle>
                    <v-btn @click="addContact(item.auth.email, true)">resend</v-btn>
                  </div>
                  

                  <v-list-item-subtitle v-if="item.requestedBy != mydata._id && !item.connecteds"> New contact request </v-list-item-subtitle>
                  <v-list-item-subtitle v-if="item.connecteds === true"> {{item.lastMessage}} </v-list-item-subtitle>

                  <v-btn v-if="!item.auth" @click="handleContactRequest(index, true)">accept</v-btn>
                  <v-btn v-if="!item.auth" @click="handleContactRequest(index, false)">reject</v-btn>
                </v-list-item-content>
              </v-list-item>
            </template>
          </v-list>
        </v-col>
      </v-row>
    </v-col>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import * as firebase from "firebase";
import "firebase/database";
import { axiosRequest, emailRegex } from '@/helpers/index'
import { Socket } from 'vue-socket.io-extended'

@Component({})
export default class Contacts extends Vue {

  newContactEmail = "";
  allContacts: Record<any, any> = {};
  addContactResponseMessage = "";
  alert = false;
  api: string = (this.$root as any).urlApi;
  chatKey: string;
  addingContact = false;

  defineContactEmail(val: string) {
    this.newContactEmail = val;
  }

  get mydata() {
    return this.$store.getters.user;
  }
  get userContacts() {
    return this.$store.getters.user.contacts;
  }
  
  selectChat(item: any) {
    this.$emit('chatSelected', item)
  }

  async handleContactRequest(contactUid: string, accepted: boolean) {
    const myuid = this.mydata._id;
    try {
      const postReq = await axiosRequest('POST', this.api+'/get-user-uid', {uid: contactUid})
      if(accepted) {
        firebase.database().ref("users/")
        .child(myuid)
        .child('contacts/'+contactUid+'/auth').set(postReq.data);

        firebase.database().ref("users/")
        .child(myuid)
        .child('contacts/'+contactUid+'/connecteds').set(true);

        firebase.database().ref("users/")
          .child(contactUid)
          .child('contacts/'+myuid+'/connecteds').set(true);
      } else {
        delete this.allContacts[contactUid]; //borrar de la lista users para el UI
        firebase.database().ref("users/")
          .child(contactUid)
          .child('contacts/'+myuid+'/connecteds').set('rejected');
        
        firebase.database().ref("users/")
          .child(myuid)
          .child('contacts/'+contactUid).remove();
      }
    } catch (error) {
      throw new Error(error)
    }
  }
  mounted() {
    const myuid = this.mydata._id;


    //onContactListUpdate
    
  }



  async addContact(email: string, resend: boolean) {
    this.alert = false;
    this.addContactResponseMessage = "";

    if(resend) {
      this.newContactEmail = email;
    }
    
    if(this.mydata.email == this.newContactEmail) {
      this.addContactResponseMessage = "You can't add yourself ۜ(סּ_סּَ`)";
      this.alert = true;
      return;
    }

    if(emailRegex(this.newContactEmail)){
      
      this.addingContact = true;
      const response = await axiosRequest('POST', this.api + '/chat/add-contact', 
        { myEmail: this.mydata.email, contactEmail: this.newContactEmail }, 
        { headers: { "x-auth-token": this.$cookies.get('jwt') }
      })
      if(response.status === 500) {
        this.addingContact = false;
        this.addContactResponseMessage = response.data.error;
        this.alert = true;
      } else {
        this.addingContact = false;
        this.addContactResponseMessage = 'Success';
        this.alert = true;
      }
    } else {
      this.addContactResponseMessage = "Invalid email format";
      this.alert = true;
      return;
    }
  }
}
</script>
<style lang="scss">


.col-contacts {
  background: linear-gradient($main_2, $main_3);
  border-right: 1px solid #b4b4b4;
  padding-top: 0 !important;
  .v-list {
    background-color: transparent !important;
    .v-list-item__content {
      color: white !important;
      font-weight: 600;
    }
    .v-list-item__subtitle {
      color: white !important;
      font-weight: 100;
    }
  }
}
.bg-header {
  background-color: $main_1;
}
.v-list {
  padding: 0 !important;
}
.theme--light.v-expansion-panels .v-expansion-panel {
  background-color: $main_2 !important;
  color: white !important;
}
</style>