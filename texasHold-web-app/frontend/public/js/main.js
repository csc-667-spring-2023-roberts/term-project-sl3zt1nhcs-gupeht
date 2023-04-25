document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
  
    if (registerForm) {
      registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = document.querySelector('#register-form input[name="username"]').value;
        const email = document.querySelector('#register-form input[name="email"]').value;
        const password = document.querySelector('#register-form input[name="password"]').value;
  
        try {
          const response = await fetch('/user/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
          });
  
          if (response.status === 201) {
            alert('User created successfully');
            location.href = '/user/login';
          } else {
            const errorData = await response.json();
            alert(errorData.message);
          }
        } catch (error) {
          console.error(error);
          alert('An error occurred during registration');
        }
      });
    }
  
    if (loginForm) {
      loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = document.querySelector('#login-form input[name="username"]').value;
        const password = document.querySelector('#login-form input[name="password"]').value;
  
        try {
          const response = await fetch('/user/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
          });
  
          if (response.status === 200) {
            const userData = await response.json();
            alert('User logged in successfully');
            // Redirect to the desired page after successful login
            location.href = '/';
          } else {
            const errorData = await response.json();
            alert(errorData.message);
          }
        } catch (error) {
          console.error(error);
          alert('An error occurred during login');
        }
      });
    }
  });
  