document.addEventListener("DOMContentLoaded", () => {
  const getCookie = (name) => {
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)")
    );
    return match ? match[2] : null;
  };

  const getUserId = () =>
    localStorage.getItem("user_id") || getCookie("userId");

  // Login form: submit via fetch to API, store user_id in localStorage
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(loginForm);
      const body = {
        email: formData.get("email"),
        password: formData.get("password"),
      };

      try {
        const res = await fetch("/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          alert(err.error || "Erro no login");
          return;
        }

        const data = await res.json();
        if (data && data.user && data.user.id) {
          localStorage.setItem("user_id", String(data.user.id));
        }

        window.location.href = "/pages/ideas";
      } catch (err) {
        console.error(err);
        alert("Erro no login");
      }
    });
  }

  // Register form: submit via fetch to API then redirect to login
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(registerForm);
      const body = {
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
      };

      try {
        const res = await fetch("/api/users/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          alert(err.error || "Erro no cadastro");
          return;
        }

        window.location.href = "/pages/login";
      } catch (err) {
        console.error(err);
        alert("Erro no cadastro");
      }
    });
  }

  // New idea form: submit with x-user-id header
  const newIdeaForm = document.getElementById("idea-new-form");
  if (newIdeaForm) {
    // Only intercept and send via fetch when the form's action targets the API.
    // If action posts to a view route (e.g. /pages/ideas) let it submit normally so
    // the server can attach cookies/headers (this matches register/login flow).
    const action = newIdeaForm.getAttribute("action") || "";
    if (action.startsWith("/api/")) {
      newIdeaForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const userId = getUserId();
        if (!userId) return alert("Você precisa estar logado");

        const formData = new FormData(newIdeaForm);
        const body = {
          title: formData.get("title"),
          description: formData.get("description"),
          category_id: formData.get("category") || null,
        };

        try {
          const res = await fetch(action, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-user-id": userId,
            },
            body: JSON.stringify(body),
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            alert(err.error || "Erro ao criar ideia");
            return;
          }

          window.location.href = "/pages/ideas";
        } catch (err) {
          console.error(err);
          alert("Erro ao criar ideia");
        }
      });
    }
    // otherwise let the browser submit the form to the view route (/pages/ideas)
  }

  // Edit idea form
  const editIdeaForm = document.getElementById("idea-edit-form");
  if (editIdeaForm) {
    editIdeaForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const userId = getUserId();
      if (!userId) return alert("Você precisa estar logado");

      const formData = new FormData(editIdeaForm);
      const action = editIdeaForm.getAttribute("action") || "";
      // action is like /api/ideas/{id}?_method=PUT
      const match = action.match(/\/api\/ideas\/(\d+)/);
      const id = match ? match[1] : null;
      if (!id) return alert("ID da ideia inválido");

      const body = {
        title: formData.get("title"),
        description: formData.get("description"),
        category_id: formData.get("category") || null,
      };

      try {
        const res = await fetch(`/api/ideas/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId,
          },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          alert(err.error || "Erro ao atualizar ideia");
          return;
        }

        window.location.href = `/pages/ideas/${id}`;
      } catch (err) {
        console.error(err);
        alert("Erro ao atualizar ideia");
      }
    });
  }

  // Vote forms (class vote-form) - send vote_value=1 (upvote)
  document.querySelectorAll("form.vote-form").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const userId = getUserId();
      if (!userId) return alert("Você precisa estar logado");

      const action = form.getAttribute("action");
      try {
        const res = await fetch(action, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId,
          },
          body: JSON.stringify({ vote_value: 1 }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          alert(err.error || "Erro ao votar");
          return;
        }

        // reload to update votes
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert("Erro ao votar");
      }
    });
  });

  // Simple logout handler: clear stored user_id if any link has id logout-link
  const logoutLink = document.getElementById("logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      // clear local storage and allow navigation
      localStorage.removeItem("user_id");
    });
  }
});
