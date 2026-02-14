// TEMPORARY FAKE AUTH MIDDLEWARE
// Use this during development/demo

export const protect = (req, res, next) => {
  // Fake user inject (optional, future use)
  req.user = {
    id: "demo-user",
    role: "admin",
  };

  // Always allow request
  next();
};
