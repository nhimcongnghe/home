// ⚙️ Khởi tạo Firebase App + Auth + Firestore
const firebaseConfig = {
  apiKey: "AIzaSyDY_SqgY85ij_677Bvk1I3j3rX6uXZQwKQ",
  authDomain: "webchat-7c3ad.firebaseapp.com",
  projectId: "webchat-7c3ad",
  storageBucket: "webchat-7c3ad.appspot.com",
  messagingSenderId: "895209638075",
  appId: "1:895209638075:web:98beae42d08c7783a7419e"
};

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// 🧙‍♂️ Đăng ký
function signUp() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(() => alert("Đăng ký thành công!"))
    .catch(err => alert("Lỗi: " + err.message));
}

// 🔐 Đăng nhập
function signIn() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => alert("Đăng nhập thành công!"))
    .catch(err => alert("Lỗi: " + err.message));
}

// 🚪 Đăng xuất
function signOut() {
  auth.signOut()
    .then(() => alert("Đã đăng xuất"));
}

// 💬 Gửi tin nhắn
function sendMessage() {
  const message = document.getElementById("message").value;
  const user = auth.currentUser;
  if (user && message.trim() !== "") {
    db.collection("messages").add({
      text: message,
      sender: user.email,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    document.getElementById("message").value = "";
  }
}

auth.onAuthStateChanged(user => {
  if (user) {
    // ✅ Chỉ kiểm tra admin khi có user
    db.collection("users")
      .where("email", "==", user.email)
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.isAdmin === true) {
            alert("🦔 Xin chào Admin Nhím Công Nghệ!");
            // mở giao diện admin nếu có
          }
        });
      });

    // 📡 Lắng nghe chat như thường
    db.collection("messages")
      .orderBy("timestamp")
      .onSnapshot(snapshot => {
        const chatBox = document.getElementById("chat-messages");
        chatBox.innerHTML = "";
        snapshot.forEach(doc => {
          const msg = doc.data();
          const div = document.createElement("div");
          div.textContent = `${msg.sender}: ${msg.text}`;
          chatBox.appendChild(div);
        });
        chatBox.scrollTop = chatBox.scrollHeight;
      });

  } else {
    document.getElementById("chat-messages").innerHTML = "<i>Vui lòng đăng nhập để chat</i>";
  }
});
