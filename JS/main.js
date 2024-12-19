const baseUrl = "https://tarmeezacademy.com/api/v1";
let currentPage = 1;
let lastPage = 1;
// Scrolling ?
window.addEventListener("scroll", () => {
  const endOfPage =
    window.innerHeight + window.scrollY >= document.body.offsetHeight;
  if (endOfPage && currentPage < lastPage) {
    // currentPage = currentPage + 1;
    getAllPosts(false, currentPage++);
  }
});

// Function to show the loading indicator
function showLoadingIndicator() {
  document.getElementById("loading-indicator").style.display = "flex";
}

// Function to hide the loading indicator
function hideLoadingIndicator() {
  document.getElementById("loading-indicator").style.display = "none";
}

// Simulate a page request or API call
function simulateRequest() {
  showLoadingIndicator();

  // Simulate a delay (e.g., an API call)
  setTimeout(() => {
    hideLoadingIndicator();
  }, 3000); // 3 seconds
}

// Call the function to simulate loading on page load
window.onload = simulateRequest;

// =============Get All Posts Of Users===============//

function getAllPosts(loading = true, page = 1) {
  showLoadingIndicator();

  axios
    .get(`${baseUrl}/posts?limit=4&page=${page}`)
    .then(function (response) {
      let posts = response.data.data;
      let card = document.getElementById("posts");
      lastPage = response.data.meta.last_page;
      if (loading) {
        card.innerHTML = "";
      }
      console.log(posts);

      for (onePost of posts) {
        let user = localStorage.getItem("user");
        let isMyPost =
          user != null && JSON.parse(user).id === onePost.author.id;
        let editOrDeletePostContent = isMyPost
          ? `<button type="button"
               class="btn btn-secondary"
               onclick="editPost('${encodeURIComponent(
                 JSON.stringify(onePost)
               )}')"
               style="float:right ; margin-left:5px">Edit</button>
               <button type="button"
               class="btn btn-danger"
               onclick="deletePost('${encodeURIComponent(
                 JSON.stringify(onePost)
               )}')"
               style="float:right">Delete</button>
               `
          : "";
        let content = `
        <div class="card col-9" >
            <div class="card-header">
              <span onclick="userClicked(${
                onePost.author.id
              })" style="cursor:pointer">
                <img src="${onePost.author.profile_image}" alt="" />
                <span style="font-size: 20px; font-weight: bold">${
                  onePost.author.name
                }</span>
              </span>
              ${editOrDeletePostContent}
            </div>
            <div class="card-body" onclick="clickBtn(${onePost.id})">
            <img src="${onePost.image}" alt="" />
            <h6>${onePost.created_at}</h6>
            <h5 class="card-title">${
              onePost.title === null ? "" : onePost.title
            }</h5>
            <p class="card-text">
                ${onePost.body}
            </p>
            <hr />
            <div>(${onePost.comments_count}) Comments</div>
            </div>
        </div>`;
        card.innerHTML += content;
      }
    })
    .catch(function (error) {
      console.log(error);
    })
    .finally(() => hideLoadingIndicator());
}

getAllPosts();
// =============Get All Posts Of Users===============//

function userClicked(userId) {
  window.location.href = `profile.html?userId=${userId}`;
}

// =============Show Specific POST===============//
// Get the base URL for your API
// Extract the post ID from the URL query parameter
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get("id");

function showPost() {
  showLoadingIndicator();
  axios
    .get(`${baseUrl}/posts/${postId}`)
    .then((response) => {
      const post = document.getElementById("post");
      const head = document.getElementById("head");
      post.innerHTML = ""; // Clear existing content
      head.innerHTML = ""; // Clear existing content
      const currentPost = response.data.data;
      head.innerHTML = currentPost.author.name;

      // get comments
      let commentBody = "";
      for (comment of currentPost.comments) {
        commentBody += `
      <div>
      <img src="${comment.author.profile_image}" style="border-radius: 50%;
      width: 30px;
      height: 30px;" alt="" />
      <span>${comment.author.name}</span>
      </div>
      <h6>${comment.body}</h6>
      <hr>
      `;
      }
      // editt //
      console.log();
      let user = localStorage.getItem("user");
      let isMyPost = user && JSON.parse(user).id === currentPost.author.id;
      let editOrDeletePostContent = isMyPost
        ? `<button type="button"
        class="btn btn-secondary"
        onclick="editPost('${encodeURIComponent(JSON.stringify(currentPost))}')"
        style="float:right ; margin-left:5px"">Edit</button>
        <button type="button"
            class="btn btn-danger"
            onclick="deletePost('${encodeURIComponent(
              JSON.stringify(currentPost)
            )}')"
            style="float:right">Delete</button>
        `
        : "";
      // Render the current post
      post.innerHTML = `
      <div class="card col-9">
        <div class="card-header">
        <span onclick="userClicked(${
          currentPost.author.id
        })" style="cursor:pointer">
                <img src="${currentPost.author.profile_image}" alt="" />
                <span style="font-size: 20px; font-weight: bold">${
                  currentPost.author.name
                }</span>
        </span>
          ${editOrDeletePostContent}
        </div>
        <div class="card-body">
          <img src="${currentPost.image}" alt="" />
          <h6>${currentPost.created_at}</h6>
          <h5 class="card-title">
            ${currentPost.title === null ? "" : currentPost.title}
          </h5>
          <p class="card-text">
            ${currentPost.body}
          </p>
          <hr />
          <div>(${currentPost.comments_count}) Comments</div>
          
        </div>
        <div class="card-footer">
            ${commentBody}
            <div style="display: flex; justify-content: space-between;"> 
              <input
                type="text"
                placeholder="enter your comment"
                id="comment-input"
                style="border: 1px solid white; outline: none; width: 70%; border-radius : 5px"
              />
              <button type="button" style="display: block"
            id="add-comment" class="btn btn-primary" onclick='addComment()' >Add Comment</button> 
            </div>
        </div>
      </div>`;
    })
    .catch((error) => {
      console.error("Error fetching the post:", error);
    })
    .finally(() => hideLoadingIndicator());
}

showPost();

function addComment() {
  let token = localStorage.getItem("token");
  let user = localStorage.getItem("user");
  let userObj = JSON.parse(user);
  let commentInput = document.getElementById("comment-input").value;
  axios
    .post(
      `${baseUrl}/posts/${postId}/comments`,
      {
        body: `${commentInput}`,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((response) => {
      showAlert(`success`, "success");
      showPost();
      userPosts();
      profileInfo();
    })
    .catch((error) => {
      showAlert(`${error.response.data.message}`, "danger");
      console.log(error.response.data.message);
    });
}

function clickBtn(id) {
  window.location.href = `post.html?id=${id}`;
}

// =============Show Specific POST===============//

// =============Login===============//
function login(userName, password) {
  showLoadingIndicator();
  axios
    .post(`${baseUrl}/login`, {
      username: `${userName}`,
      password: `${password}`,
    })
    .then(function (response) {
      let token = response.data.token;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(response.data.user)); // Store user data
      const modalElement = bootstrap.Modal.getInstance(
        document.getElementById("loginModal")
      );
      modalElement.hide(); // Hide the modal
      showAlert("Nice, you logged in successfully!", "success"); // Call showAlert directly
      setTimeout(() => location.reload(), 1500);
    })
    .catch(function (error) {
      alert(error.response.data.message); // Show error message
    })
    .finally(() => hideLoadingIndicator());
}

let loginBtn = document.getElementById("login-btn");
loginBtn.addEventListener("click", function () {
  const userName = document.getElementById("username").value;
  const password = document.getElementById("passw").value;
  login(userName, password);
});
// =============Login===============//

// =============ShowAlert===============//
function showAlert(message, type) {
  const alertPlaceholder = document.getElementById("liveAlertPlaceholder");

  const wrapper = document.createElement("div");
  wrapper.innerHTML = [
    `<div class="alert alert-${type} alert-dismissible" role="alert">`,
    `   <div>${message}</div>`,
    '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
    "</div>",
  ].join("");

  const alertElement = wrapper.firstChild; // Get the created alert element
  alertPlaceholder.append(wrapper);

  // Automatically hide the alert after 2 seconds
  setTimeout(() => {
    alertElement.classList.add("fade"); // Add Bootstrap fade-out effect
    setTimeout(() => alertElement.remove(), 1500); // Remove element after fade effect
  }, 2000);
}
// =============ShowAlert===============//

// =============LogOut===============//
let logoutBtn = document.getElementById("logout");
logoutBtn.addEventListener("click", function () {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  showAlert("Nice, you logged out successfully!", "danger"); // Call showAlert directly
  setTimeout(() => location.reload(), 1000);
});
// =============LogOut===============//

// =============SetUpUI===============//
function setupUI() {
  let addCommentBtn = document.getElementById("add-comment");
  let logBtn = document.getElementById("login");
  let regBtn = document.getElementById("register");
  let logoutBtn = document.getElementById("logout");
  const nameHeader = document.getElementById("name-header");
  const imageHeader = document.getElementById("image-header");
  let token = localStorage.getItem("token");
  let addPostBtn = document.getElementById("add-post");
  let profilePage = document.getElementById("profile-page");
  if (token !== null) {
    if (addPostBtn != null) {
      addPostBtn.style.display = "block";
    }
    logBtn.style.display = "none";
    regBtn.style.display = "none";
    logoutBtn.style.display = "block";
    const user = localStorage.getItem("user");
    let userObject = JSON.parse(user);
    nameHeader.innerHTML = userObject.name;
    imageHeader.src = userObject.profile_image;
    nameHeader.style.display = "block";
    imageHeader.style.display = "block";
  } else {
    profilePage.style.display = "none";
    logoutBtn.style.display = "none";
  }
}

setupUI();
// =============SetUpUI===============//

// =============Register===============//
function register(imageFile, username, email, password, name) {
  const formData = new FormData();

  // Append form data
  formData.append("username", username);
  formData.append("password", password);
  formData.append("email", email);
  formData.append("name", name);

  // Append the image file (assuming only one file is selected)
  if (imageFile.length > 0) {
    formData.append("image", imageFile[0]);
  }

  // Post using Axios
  showLoadingIndicator();
  axios
    .post(`${baseUrl}/register`, formData, {
      headers: {
        "Content-Type": "multipart/form-data", // to send data as formData
      },
    })
    .then((response) => {
      let token = response.data.token;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(response.data.user)); // Store user data
      const modalElement = bootstrap.Modal.getInstance(
        document.getElementById("registerModal")
      );
      modalElement.hide(); // Hide the modal
      showAlert("Your email created successfully!", "success");
      setTimeout(() => location.reload(), 1500);
    })
    .catch((error) => {
      console.log(error.response.data);
      showAlert(`${error.response.data.message}`, "danger");
    })
    .finally(() => hideLoadingIndicator());
}

// Attach event listener
let signUpBtn = document.getElementById("signup-btn");
signUpBtn.addEventListener("click", function () {
  const userName = document.getElementById("registeruser").value;
  const name = document.getElementById("registername").value;
  const email = document.getElementById("registeremail").value;
  const password = document.getElementById("registerpassword").value;
  const image = document.getElementById("image").files;

  // Call the register function with the input values
  register(image, userName, email, password, name);
});
// =============Register===============//

// =============Create Post===============//
function createPost(title, body, imageFile) {
  const formData = new FormData();

  // Append form data
  formData.append("title", title);
  formData.append("body", body);
  // Append the image file (assuming only one file is selected)
  if (imageFile.length > 0) {
    formData.append("image", imageFile[0]);
  }
  let token = localStorage.getItem("token");
  axios
    .post(`${baseUrl}/posts`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      console.log(response);

      const modalElement = bootstrap.Modal.getInstance(
        document.getElementById("addPostModal")
      );
      modalElement.hide(); // Hide the modal
      showAlert("Your Post is created!", "success");
      setTimeout(() => {
        location.reload();
      }, 100);
    })
    .catch((error) => {
      const modalElement = bootstrap.Modal.getInstance(
        document.getElementById("addPostModal")
      );
      modalElement.hide(); // Hide the modal
      showAlert(error.response.data.message, "danger");
      console.log(error);
    });
}

let createBtn = document.getElementById("create-post-btn");
if (createBtn != null) {
  createBtn.addEventListener("click", function () {
    let image = document.getElementById("post-image").files;
    let title = document.getElementById("title").value;
    let body = document.getElementById("sub-title").value;
    createPost(title, body, image);
  });
}

// =============Create Post===============//
// =============Edit Post===============//
function editPost(postObject) {
  let post = JSON.parse(decodeURIComponent(postObject));

  let title = document.getElementById("edit-title");
  title.value = post.title;
  let body = document.getElementById("edit-body");
  body.value = post.body;

  let editPostModal = document.getElementById("editPostModal");
  let postModal = new bootstrap.Modal(editPostModal);
  postModal.toggle();

  let token = localStorage.getItem("token");

  let editPostBtn = document.getElementById("edit-post-btn");
  editPostBtn.addEventListener("click", () => {
    axios
      .put(
        `${baseUrl}/posts/${post.id}`,
        {
          title: `${title.value}`,
          body: `${body.value}`,
        },
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        postModal.hide();
        showAlert("You edit your post successfully", "success");
        getAllPosts();
        userPosts();
        profileInfo();
        console.log(response);
      })
      .catch((error) => {
        postModal.hide();
        showAlert(error.response.data.message, "danger");

        console.log(error);
      });
  });
}
// =============Edit Post===============//

// =============Delete Post===============//
function deletePost(postObject) {
  let post = JSON.parse(decodeURIComponent(postObject));

  let deletePostModal = document.getElementById("deleteModal");
  let postModal = new bootstrap.Modal(deletePostModal);
  postModal.toggle();

  let token = localStorage.getItem("token");

  let deletePostBtn = document.getElementById("confirmDelete");
  deletePostBtn.addEventListener("click", function () {
    axios
      .delete(`${baseUrl}/posts/${post.id}`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        postModal.hide();
        showAlert("your post deleted successfully!", "success");
        userPosts();
        profileInfo();
        getAllPosts();
        console.log(response);
      })
      .catch((error) => {
        postModal.hide();
        showAlert(error.response.data.message, "danger");

        console.log(error);
      });
  });
}
// =============Delete Post===============//

// =============Profile Info ===============//
let userParams = new URLSearchParams(window.location.search);
let userId = userParams.get("userId");

if (userId !== null) {
  function profileInfo() {
    let profileImage = document.getElementById("profile-image");
    let profileEmail = document.getElementById("profile-email");
    let profileUsername = document.getElementById("profile-username");
    let profilePosts = document.getElementById("profile-posts");
    let profileComments = document.getElementById("profile-comments");

    axios
      .get(`${baseUrl}/users/${userId}`)
      .then((response) => {
        console.log(response);
        let user = response.data.data;
        profileImage.src = user.profile_image;
        profileUsername.innerHTML = user.username;
        profileEmail.innerHTML = user.email;
        profileComments.innerHTML = user.comments_count;
        profilePosts.innerHTML = user.posts_count;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  profileInfo();

  function userPosts() {
    axios
      .get(`${baseUrl}/users/${userId}/posts`)
      .then((response) => {
        let userPosts = response.data.data;
        let userPost = document.getElementById("user-post");
        userPost.innerHTML = "";

        for (onePost of userPosts) {
          let user = localStorage.getItem("user");
          let isMyPost =
            user != null && JSON.parse(user).id === onePost.author.id;
          let editOrDeletePostContent = isMyPost
            ? `<button type="button"
               class="btn btn-secondary"
               onclick="editPost('${encodeURIComponent(
                 JSON.stringify(onePost)
               )}')"
               style="float:right ; margin-left:5px">Edit</button>
               <button type="button"
               class="btn btn-danger"
               onclick="deletePost('${encodeURIComponent(
                 JSON.stringify(onePost)
               )}')"
               style="float:right">Delete</button>
               `
            : "";
          let content = `
        <div class="card col-9" >
            <div class="card-header">
              <img src="${onePost.author.profile_image}" alt="" />
              <span style="font-size: 20px; font-weight: bold">${
                onePost.author.username
              }</span>
                ${editOrDeletePostContent}
            </div>
            <div class="card-body" onclick="clickBtn(${onePost.id})">
              <img src="${onePost.image}" alt="" />
              <h6>${onePost.created_at}</h6>
              <h5 class="card-title">${
                onePost.title === null ? "" : onePost.title
              }</h5>
              <p class="card-text">
                  ${onePost.body}
              </p>
              <hr />
              <div>(${onePost.comments_count}) Comments</div>
            </div>
        </div>
        `;
          userPost.innerHTML += content;
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  userPosts();
} else {
  let user = JSON.parse(localStorage.getItem("user"));
  function profileInfo() {
    let profileImage = document.getElementById("profile-image");
    let profileEmail = document.getElementById("profile-email");
    let profileUsername = document.getElementById("profile-username");
    let profilePosts = document.getElementById("profile-posts");
    let profileComments = document.getElementById("profile-comments");

    axios
      .get(`${baseUrl}/users/${user.id}`)
      .then((response) => {
        console.log(response);
        let user = response.data.data;
        profileImage.src = user.profile_image;
        profileUsername.innerHTML = user.username;
        profileEmail.innerHTML = user.email;
        profileComments.innerHTML = user.comments_count;
        profilePosts.innerHTML = user.posts_count;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  profileInfo();

  function userPosts() {
    axios
      .get(`${baseUrl}/users/${user.id}/posts`)
      .then((response) => {
        let userPosts = response.data.data;
        let userPost = document.getElementById("user-post");
        userPost.innerHTML = "";

        for (onePost of userPosts) {
          let user = localStorage.getItem("user");
          let isMyPost =
            user != null && JSON.parse(user).id === onePost.author.id;
          let editOrDeletePostContent = isMyPost
            ? `<button type="button"
               class="btn btn-secondary"
               onclick="editPost('${encodeURIComponent(
                 JSON.stringify(onePost)
               )}')"
               style="float:right ; margin-left:5px">Edit</button>
               <button type="button"
               class="btn btn-danger"
               onclick="deletePost('${encodeURIComponent(
                 JSON.stringify(onePost)
               )}')"
               style="float:right">Delete</button>
               `
            : "";
          let content = `
        <div class="card col-9" >
            <div class="card-header">
              <img src="${onePost.author.profile_image}" alt="" />
              <span style="font-size: 20px; font-weight: bold">${
                onePost.author.username
              }</span>
                ${editOrDeletePostContent}
            </div>
            <div class="card-body" onclick="clickBtn(${onePost.id})">
              <img src="${onePost.image}" alt="" />
              <h6>${onePost.created_at}</h6>
              <h5 class="card-title">${
                onePost.title === null ? "" : onePost.title
              }</h5>
              <p class="card-text">
                  ${onePost.body}
              </p>
              <hr />
              <div>(${onePost.comments_count}) Comments</div>
            </div>
        </div>
        `;
          userPost.innerHTML += content;
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  userPosts();
}

// =============Profile Info ===============//
