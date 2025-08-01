<template>
  <div class="login-container">
    <h2>Login to access your Bible</h2>
    <input v-model="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />
    <div class="buttons">
      <button @click="login">Login</button>
      <button @click="register">Register</button>
    </div>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const emit = defineEmits(['loginSuccess']);
const email = ref('');
const password = ref('');
const error = ref('');

const login = async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    emit('loginSuccess');
  } catch (e: any) {
    error.value = e.message;
  }
};

const register = async () => {
  try {
    await createUserWithEmailAndPassword(auth, email.value, password.value);
    emit('loginSuccess');
  } catch (e: any) {
    error.value = e.message;
  }
};
</script>

<style scoped>
.login-container {
  text-align: center;
  padding: 2rem;
}
input {
  margin: 0.5rem;
  padding: 0.5rem;
}
.buttons {
  margin-top: 1rem;
}
.error {
  color: red;
  margin-top: 1rem;
}
</style>
