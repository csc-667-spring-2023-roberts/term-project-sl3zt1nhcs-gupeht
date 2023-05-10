import { fetchLobby } from "./main";


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

      console.log(responseData);

      const userId = responseData.user.user_id;
      const userName = responseData.user.username;


      // Store the localStorage or sessionStorage
      localStorage.setItem('token', responseData.token);
      localStorage.setItem('user_id',userId);
      localStorage.setItem('userName',userName);

    
      messageDiv.textContent = 'User logged in successfully';
      
      setTimeout(()=>{
        fetchLobby();
      },1000);

    } else {
      messageDiv.textContent = 'Incorrect username or password';
    }
  } catch (error) {
    console.error(error);
    messageDiv.textContent = 'An error occurred during login';
  }
}
