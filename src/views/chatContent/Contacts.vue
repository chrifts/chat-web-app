<template>
    <v-col cols=4 class="col-contacts">
      <v-row style="height: 68px;" class="bg-gray">
        <v-col cols=12>
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-header>
                <template v-slot:default="{ open }">
                  <v-row no-gutters>
                    <v-col cols="12" class="text--secondary">
                      <v-fade-transition leave-absolute>
                        <span v-if="open" key="0">
                          Add contact
                        </span>
                        <span v-else key="1">
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
                <v-btn @click="addContact(newContactEmail)">Add</v-btn>
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
                    :class="{'red lighten-5': !item.auth, 'green lighten-5' : item.requestedBy == mydata.uid && !item.connecteds, '': item.connecteds}"
                    v-html="item.extraData.firstName + ' ' +item.extraData.lastName"
                  >
                  </v-list-item-title>
                  
                  <v-list-item-subtitle v-if="item.requestedBy == mydata.uid && !item.connecteds"> Contact request pending </v-list-item-subtitle>
                  <div v-else-if="item.connecteds == 'rejected'">
                    <v-list-item-subtitle > Request rejected </v-list-item-subtitle>
                    <v-btn @click="addContact(item.auth.email, true)">resend</v-btn>
                  </div>
                  

                  <v-list-item-subtitle v-if="item.requestedBy != mydata.uid && !item.connecteds"> New contact request </v-list-item-subtitle>
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

@Component({})
export default class Contacts extends Vue {
  //data
  newContact: Record<any, any> = {};
  newContactEmail = "";
  allContacts: Record<any, any> = {};
  addContactResponseMessage = "";
  alert = false;
  api: string = (this.$root as any).urlApi;
  chatKey: string;

  @Prop()
  //elpepe!: String; this tells TS that the value will be assigned at runtime.
  //elpepe?: String; Optional prop
  testPropr: string | undefined;

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
    const myuid = this.mydata.uid;
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
    const myuid = this.mydata.uid;
    //RUNTIME-SET MY EXTRADATA CHANGES ON MY CONTACTS
    firebase
      .database()
      .ref("users/")
      .child(myuid) //cuando YO cambio mi nombre
      .on("value", (snapshot) => {
        const change = snapshot.val(); 
        const update = snapshot.val(); //mando un update a todos mis contactos
        if(change.contacts) {
          delete update['contacts'];
          Object.keys(change.contacts).map(function(_uid) {
            if(change.contacts[_uid].connecteds != 'rejected') {
              firebase
              .database()
              .ref('users/')
              .child(_uid)
              .child('contacts/'+ myuid + '/extraData/').set(update)
            }
          });
        }
    });

    //RUNTIME-UPDATE MY CONTACT LIST 
    firebase
      .database()
      .ref("users/")
      .child(myuid)
      .child('contacts/')
      .on("value", (snapshot) => {
        this.allContacts = snapshot.val();
    });
  }
  async addContact(email: string, resend: boolean) {
    this.alert = false;
    this.addContactResponseMessage = "";

    if(resend) {
      this.newContactEmail = email;
    }
    
    if(this.mydata.email == this.newContactEmail) {
      this.addContactResponseMessage = "You can't add you  ۜ(סּ_סּَ`)";
      this.alert = true;
      return;
    }

    if(emailRegex(this.newContactEmail)){
      try {
        const response = await axiosRequest('GET', this.api+'/get-user?email='+this.newContactEmail)
        this.newContact = response.data;
        const ref = firebase.database().ref('users/' + this.mydata.uid + '/contacts/' + this.newContact.auth.uid);
        ref.once("value")
        .then(snapshot => {
          if(!snapshot.exists() || snapshot.val().connecteds == 'rejected') {
            this.newContact.requestedBy = this.mydata.uid;
            this.newContact.connecteds = false;
            this.addContactResponseMessage = "Success";
            this.$store.commit("setUserContacts", this.newContact.auth.uid);
            firebase.database().ref('users/' + this.mydata.uid + '/contacts/' + this.newContact.auth.uid).set(this.newContact);
            firebase.database().ref('users/' + this.newContact.auth.uid + '/contacts/' + this.mydata.uid + '/requestedBy').set(this.mydata.uid);
            firebase.database().ref('users/' + this.newContact.auth.uid + '/contacts/' + this.mydata.uid + '/connecteds').set(false);
            this.alert = true;
            return;
          } else {
            this.addContactResponseMessage = "User exists";
            this.alert = true;
            return;
          }
        })
        .catch(error => {
          this.alert = true;
          this.addContactResponseMessage = error;
          throw new Error(error);
        });
      } catch (error) {
        this.addContactResponseMessage = error;
        this.alert = true;
        throw new Error(error);
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
$chat-theme: #ececec;

.col-contacts {
  border-right: 1px solid #dadada;
  padding-top: 0;
}
.bg-gray {
  background-color: $chat-theme;
}
.v-list {
  padding: 0 !important;
}
.theme--light.v-expansion-panels .v-expansion-panel {
  background-color: $chat-theme !important;
}
</style>