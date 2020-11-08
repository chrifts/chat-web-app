<template>
  <div>
    <v-app>
      <v-main>
        <v-container fluid fill-height>
          <v-layout align-center justify-center>
            <v-flex xs12 sm8 md4>
              <v-card class="elevation-12">
                <v-toolbar color="primary">
                  <v-toolbar-title>Register form</v-toolbar-title>
                </v-toolbar>
                <v-card-text>
                  <v-form ref="form" v-model="valid" lazy-validation>
                    <v-text-field
                      prepend-icon="person"
                      v-model="email"
                      :rules="emailRules"
                      label="E-mail"
                      required
                    ></v-text-field>
                    <v-text-field
                      prepend-icon="person"
                      v-model="firstName"
                      label="Name"
                      required
                    ></v-text-field>
                    <v-text-field
                      prepend-icon="person"
                      v-model="lastName"
                      label="Last name"
                      required
                    ></v-text-field>
                    <v-text-field
                      prepend-icon="lock"
                      v-model="password"
                      :rules="passwordRules"
                      label="Password"
                      required
                      :append-icon="
                        passwordShow ? 'visibility' : 'visibility_off'
                      "
                      :type="passwordShow ? 'text' : 'password'"
                      @click:append="passwordShow = !passwordShow"
                    ></v-text-field>
                    <v-text-field
                      prepend-icon="lock"
                      v-model="confirmPassword"
                      label="Confirm Password"
                      :rules="passwordRules"
                      required
                      :append-icon="
                        confirmPasswordShow ? 'visibility' : 'visibility_off'
                      "
                      :type="confirmPasswordShow ? 'text' : 'password'"
                      @click:append="confirmPasswordShow = !confirmPasswordShow"
                    ></v-text-field>
                  </v-form>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn :disabled="!valid" color="success" @click="register"
                    >Register</v-btn
                  >
                  <!-- <v-btn color="error" @click="reset">Reset</v-btn> -->
                </v-card-actions>
              </v-card>
            </v-flex>
          </v-layout>
        </v-container>
      </v-main>
    </v-app>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import * as firebase from "firebase";

@Component({})
export default class Register extends Vue {
  public passwordShow = false;
  public confirmPasswordShow = false;
  public valid = false;
  public email = "";
  public firstName = "";
  public lastName = "";
  //PHONE
  public emailRules = [
    (v: any) => !!v || "E-mail is required",
    (v: any) => /.+@.+/.test(v) || "E-mail must be valid"
  ];
  public password = "";
  public confirmPassword = "";
  public passwordRules = [
    (v: any) => !!v || "Password and Confirm password Required"
  ];

  public register() {
    if (
      (this.$refs.form as Vue & { validate: () => boolean }).validate() &&
      this.confirmPassword == this.password
    ) {
      console.log("Form is valid");
      this.createUser();
    }
  }
  

  createUser() {
    firebase
      .auth()
      .createUserWithEmailAndPassword(this.email, this.password)
      .then(response => {
        firebase.database().ref('users/' + response.user!.uid).set({
          firstName: this.firstName,
          lastName: this.lastName
        })
      })
      .catch(error => {
        alert("failure");
        console.log(error);
      });
  }
}
</script>

<style scoped></style>
