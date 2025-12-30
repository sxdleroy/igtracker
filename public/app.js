const usernameInput = document.getElementById("username");
const searchButton = document.getElementById("searchButton");
const statusMessage = document.getElementById("status");
const resultsSection = document.getElementById("results");
const avatar = document.getElementById("avatar");
const profileName = document.getElementById("profileName");
const privacyStatus = document.getElementById("privacyStatus");

const followersList = document.getElementById("followersList");
const followingList = document.getElementById("followingList");
const likesList = document.getElementById("likesList");
const commentsList = document.getElementById("commentsList");

const setLoading = (isLoading) => {
  searchButton.disabled = isLoading;
  statusMessage.textContent = isLoading ? "Loading public data..." : "";
  statusMessage.style.color = isLoading ? "#4c5161" : "";
};

const renderEmpty = (element, message) => {
  element.innerHTML = `<li class="empty">${message}</li>`;
};

const renderUserList = (element, items) => {
  if (!items || items.length === 0) {
    renderEmpty(element, "No public data available.");
    return;
  }

  element.innerHTML = items
    .map(
      (item) => `
        <li class="list-item">
          ${
            item.profilePicture
              ? `<img src="${item.profilePicture}" alt="${item.username}" />`
              : ""
          }
          <span>@${item.username}</span>
        </li>
      `
    )
    .join("");
};

const renderLikes = (element, items) => {
  if (!items || items.length === 0) {
    renderEmpty(element, "No public likes available.");
    return;
  }

  element.innerHTML = items
    .map(
      (item) => `
        <li class="list-item">
          <a href="${item.postUrl}" target="_blank" rel="noreferrer">Post</a>
          <span>liked by @${item.username}</span>
        </li>
      `
    )
    .join("");
};

const renderComments = (element, items) => {
  if (!items || items.length === 0) {
    renderEmpty(element, "No public comments available.");
    return;
  }

  element.innerHTML = items
    .map(
      (item) => `
        <li class="list-item">
          <a href="${item.postUrl}" target="_blank" rel="noreferrer">Post</a>
          <span>@${item.username}: "${item.text}"</span>
        </li>
      `
    )
    .join("");
};

const handleSearch = async () => {
  const username = usernameInput.value.trim();

  if (!username) {
    statusMessage.textContent = "Please enter an Instagram username.";
    statusMessage.style.color = "#d14343";
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(`/api/profile/${encodeURIComponent(username)}`);
    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error || "Unknown error");
    }

    resultsSection.classList.remove("hidden");
    profileName.textContent = data.username || username;
    avatar.src = data.profilePicture || "";

    if (data.isPrivate) {
      privacyStatus.textContent = data.message || "This account is private.";
      privacyStatus.style.color = "#d14343";
      renderEmpty(followersList, "Private account.");
      renderEmpty(followingList, "Private account.");
      renderEmpty(likesList, "Private account.");
      renderEmpty(commentsList, "Private account.");
    } else {
      privacyStatus.textContent = "Public account";
      privacyStatus.style.color = "#2a2f3b";
      renderUserList(followersList, data.recentFollowers);
      renderUserList(followingList, data.recentFollowing);
      renderLikes(likesList, data.recentLikes);
      renderComments(commentsList, data.recentComments);
    }
  } catch (error) {
    statusMessage.textContent = error.message;
    statusMessage.style.color = "#d14343";
  } finally {
    setLoading(false);
  }
};

searchButton.addEventListener("click", handleSearch);
usernameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleSearch();
  }
});
