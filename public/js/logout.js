document.addEventListener("DOMContentLoaded", () => {
  const logoutLink = document.getElementById("logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      document.cookie =
        "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = "/pages/login";
    });
  }
});
