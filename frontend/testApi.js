const API_URL = "https://unresurrected-agonistic-pauline.ngrok.io/api/users";
const ADMIN_JWT_TOKEN = "ici_ton_token_admin"; // <-- remplace par ton vrai token

async function fetchUsers() {
  try {
    const res = await fetch(API_URL, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${ADMIN_JWT_TOKEN}`,
        'Content-Type': 'application/json'
      },
    });
    const users = await res.json();
    console.log("Users from backend:", users);
  } catch (err) {
    console.error("Error fetching users:", err);
  }
}

async function createUser() {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${ADMIN_JWT_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: "testngrok@example.com",
        name: "Ngrok User",
        blockReason: null,
      }),
    });
    const newUser = await res.json();
    console.log("Created user:", newUser);
  } catch (err) {
    console.error("Error creating user:", err);
  }
}

// Lancer les tests
fetchUsers();
createUser();
