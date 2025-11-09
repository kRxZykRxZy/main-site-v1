import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebaseConfig";

let currentUsername = null;

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUsername = user.displayName || user.email || "User";
  } else {
    currentUsername = null;
  }
});

const getUsername = () => currentUsername;
export default getUsername;
