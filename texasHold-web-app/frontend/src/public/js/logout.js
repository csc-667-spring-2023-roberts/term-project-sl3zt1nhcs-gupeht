import { checkLoginStatus } from './main';

export async function logout() {
  try {
    // Get the JWT token from localStorage or sessionStorage
    const token = localStorage.getItem('token');

    const response = await fetch('/user/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Add the Authorization header
      },
    });

    if (response.status === 200) {
      // Remove the JWT token from the localStorage or sessionStorage
      localStorage.removeItem('token');

      // Update the logout link visibility
      checkLoginStatus();

        // Hide the Logout link
        const logoutLink = document.querySelector('#logout');
        if (logoutLink) {
          logoutLink.classList.add('hidden');
        }
  
      alert('User logged out successfully');
      // Redirect to the login page after successful logout
      location.href = '/user/login';
    } else {
      const errorData = await response.json();
      alert(errorData.message);
    }
  } catch (error) {
    console.error(error);
    alert('An error occurred during logout');
  }
}
