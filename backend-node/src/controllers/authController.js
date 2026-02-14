import jwt from "jsonwebtoken";

export const login = (req, res) => {
  const { email } = req.body;
  // demo login
  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.json({ token });
};
