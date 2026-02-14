export const protect = (req, res, next) => {
  console.log("🔥 FAKE AUTH ENABLED (DEMO MODE)");
  req.user = { id: "demo-user", role: "demo" };
  next();
};
