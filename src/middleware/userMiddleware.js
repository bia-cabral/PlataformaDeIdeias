async function userMiddleware(req, res, next) {
  try {
    const cookieHeader = req.headers.cookie || "";
    const match = cookieHeader.match(/(^|; )userId=([^;]+)/);
    const userId =
      (req.cookies && req.cookies.userId) || (match ? match[2] : null);

    if (userId && !isNaN(userId)) {
      const response = await fetch(
        `http://localhost:${process.env.PORT || 3000}/api/users/${userId}`,
        {
          headers: {
            "x-user-id": String(userId),
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        res.locals.user = data.user;
        req.user = data.user;
      } else {
        // Se o usuário não for encontrado, limpa o cookie
        res.clearCookie("userId");
      }
    }

    next();
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error);
    res.clearCookie("userId");
    next();
  }
}

module.exports = userMiddleware;
