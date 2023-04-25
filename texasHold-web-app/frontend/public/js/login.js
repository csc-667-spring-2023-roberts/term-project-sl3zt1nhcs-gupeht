export async function login(event) {
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
  }
  