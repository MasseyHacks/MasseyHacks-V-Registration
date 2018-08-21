<template>
    <div class="main"> <!--style="background-image: url('/img/background.svg'); background-position: center; background-size: cover;"-->
        <div class="spacer"></div>
        <div id="login-form-box" class="vertical-centered">

            <p v-if="$route.query.redirect">
                You need to login first.
            </p>

            <!--<div v-if="$route.query.message" style="margin:5%;">-->
                <p v-if="$route.query.message">{{$route.query.message}}</p>

                <!--
                <div id="login-form-elements">
                  <div id="button-row">
                      <router-link to="/login"><button>sign in</button></router-link>
                  </div>
                </div>
            </div>-->

            <div>
              <h2 class="subtitle">Login</h2>
              <div id="login-form-elements">
                  <form @submit.prevent="login">
                      <input v-model="email" placeholder="email" type="email" autofocus required>
                      <input v-model="pass" placeholder="password" type="password" required><br>

                      <div id="button-row">
                          <button type="submit" class="primary-button">sign in</button>
                          <router-link to="/register" v-if="settings.registrationOpen"><button>register</button></router-link>
                          <router-link to="/reset"><button>reset</button></router-link>
                      </div>

                      <p v-if="error" class="error">{{error}}</p>
                  </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import AuthService  from '../src/AuthService'
    import Session      from '../src/Session'

    export default {
        data () {
            return {
                email: '',
                pass: '',
                error: false,
                settings: Session.getSettings()
            }
        },
        created() {
            if (Session.loggedIn()) {
                this.$router.replace('/dashboard')
            }
        },
        methods: {
            login () {
                AuthService.loginWithPassword(this.email, this.pass, (err, data) => {
                    if (err) {
                        this.error = err
                    } else {
                        this.error = null;
                        if (data["2FA"]) {
                            this.$router.replace("/2fa")
                        } else {
                            this.$router.replace(this.$route.query.redirect || '/')
                        }
                    }
                })
            }
        }
    }
</script>

<style>
    .error {
        color: red;
    }
</style>
