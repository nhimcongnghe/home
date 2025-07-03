// ⚙️ Khởi tạo Firebase App + Auth + Firestore
const firebaseConfig = {
  apiKey: "AIzaSyDY_SqgY85ij_677Bvk1I3j3rX6uXZQwKQ",
  authDomain: "webchat-7c3ad.firebaseapp.com",
  projectId: "webchat-7c3ad",
  storageBucket: "webchat-7c3ad.appspot.com",
  messagingSenderId: "895209638075",
  appId: "1:895209638075:web:98beae42d08c7783a7419e"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// 🧙‍♂️ Đăng ký
function signUp() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(cred => {
      // Thêm user vào collection users
      return db.collection("users").add({
        email: cred.user.email,
        displayName: "",
        icon: "",
        isAdmin: false
      });
    })
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
    db.collection("users").where("email", "==", user.email).get().then(snapshot => {
      snapshot.forEach(doc => {
        const data = doc.data();
        db.collection("messages").add({
          text: message,
          sender: user.email,
          displayName: data.displayName || user.email,
          icon: data.icon || "",
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        document.getElementById("message").value = "";
      });
    });
  }
}

// 👀 Theo dõi người dùng và tin nhắn
auth.onAuthStateChanged(user => {
  if (user) {
    // 🧙‍♂️ Kiểm tra quyền admin
    db.collection("users")
      .where("email", "==", user.email)
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.isAdmin === true) {
            alert("🦔 Xin chào Admin Nhím Công Nghệ!");
            document.getElementById("admin-panel").style.display = "block";
            loadUserList();
          }
        });
      });

    // 📡 Lắng nghe tin nhắn
    db.collection("messages")
      .orderBy("timestamp")
      .onSnapshot(snapshot => {
        const chatBox = document.getElementById("chat-messages");
        chatBox.innerHTML = "";
        snapshot.forEach(doc => {
          const msg = doc.data();
          const name = msg.displayName || msg.sender;
          const icon = msg.icon || "";
          const div = document.createElement("div");
          div.textContent = `${icon} ${name}: ${msg.text}`;
          chatBox.appendChild(div);
        });
        chatBox.scrollTop = chatBox.scrollHeight;
      });

  } else {
    document.getElementById("chat-messages").innerHTML = "<i>Vui lòng đăng nhập để chat</i>";
    document.getElementById("admin-panel").style.display = "none";
  }
});

// 🧹 Xóa tất cả tin nhắn
function deleteAllMessages() {
  if (confirm("Bạn có chắc muốn xóa TẤT CẢ tin nhắn không?")) {
    db.collection("messages").get().then(snapshot => {
      snapshot.forEach(doc => doc.ref.delete());
      alert("Đã xóa toàn bộ tin nhắn.");
    });
  }
}

// 📜 Tải danh sách user vào admin panel
function loadUserList() {
  db.collection("users").get().then(snapshot => {
    const userList = document.getElementById("user-list");
    userList.innerHTML = "";
    snapshot.forEach(doc => {
      const user = doc.data();
      const div = document.createElement("div");
      div.innerHTML = `
        <strong>${user.email}</strong><br>
        Tên hiển thị: <input type="text" value="${user.displayName || ''}" id="name-${doc.id}">
        Icon: <input type="text" value="${user.icon || ''}" id="icon-${doc.id}" style="width:40px;">
        <button onclick="updateUser('${doc.id}')">💾 Lưu</button>
        <button onclick="deleteUserMessages('${user.email}')">🧹 Xóa tin nhắn</button>
      `;
      userList.appendChild(div);
    });
  });
}

// 💾 Cập nhật tên và icon user
function updateUser(docId) {
  const name = document.getElementById(`name-${docId}`).value;
  const icon = document.getElementById(`icon-${docId}`).value;
  db.collection("users").doc(docId).update({
    displayName: name,
    icon: icon
  }).then(() => {
    alert("✅ Cập nhật thành công!");
  });
}

// 🧼 Xóa tin nhắn của user theo email
function deleteUserMessages(email) {
  if (confirm(`Xóa tất cả tin nhắn của ${email}?`)) {
    db.collection("messages").where("sender", "==", email).get().then(snapshot => {
      snapshot.forEach(doc => doc.ref.delete());
      alert("Đã xóa tất cả tin nhắn của user.");
    });
  }
}
