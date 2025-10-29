const authMiddleware = (req, res, next) => {  
  const userId = req.headers['x-user-id'];
  
  if (!userId) {
    return res.status(401).json({
      error: "Token de autenticação não fornecido"
    });
  }

  req.user = {
    id: parseInt(userId)
  };

  next();
};

const optionalAuthMiddleware = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  
  if (userId) {
    req.user = {
      id: parseInt(userId)
    };
  }

  next();
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware
};