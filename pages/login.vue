<template>
  <div>
    <h1>ログインユーザー</h1>
    <form @submit.prevent="loginUser">
      <div class="form-group">
        <label for="email">Eメールアドレス:</label>
        <input type="text" id="email" v-model="user.email" />
      </div>
      <div class="form-group">
        <label for="password">パスワード:</label>
        <input type="text" id="password" v-model="user.password" />
      </div>
      <button type="submit">ログイン</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      user: {
        email: '',
        password: ''
      }
    };
  },
  methods: {
    loginUser() {
      this.$auth.loginWith('local', {
        data: this.user
      });
    }
  }
};
</script>
