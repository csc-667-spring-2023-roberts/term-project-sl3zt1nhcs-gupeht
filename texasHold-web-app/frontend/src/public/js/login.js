
import { checkLoginStatus } from './main';

export async function login(event) {
  const username = document.querySelector('#login-form input[name="username"]').value;
  const password = document.querySelector('#login-form input[name="password"]').value;
  const messageDiv = document.getElementById('message');

  try {
    const response = await fetch('/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const responseData = await response.json();

    if (response.status === 200) {
      // Store the JWT token in the localStorage or sessionStorage
      localStorage.setItem('token', responseData.token);

      messageDiv.textContent = 'User logged in successfully';

      checkLoginStatus(); // Update the logout link visibility

       // Redirect to the desired page after successful login
      setTimeout(()=>{
        location.href='/';
      },1000);
    
    } else {
      messageDiv.textContent = responseData.message;
    }
  } catch (error) {
    console.error(error);
    messageDiv.textContent = 'An error occurred during login';
  }
}

