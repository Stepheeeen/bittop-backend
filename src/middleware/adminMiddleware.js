export const adminAccess = (req, res, next) => {
  const adminToken = req.headers["x-admin-token"]

  // Simple check for demo purposes
  if (adminToken !== process.env.ADMIN_ACCESS_TOKEN) {
    return res.status(403).json({ message: "Unauthorized admin access" })
  }

  next()
}
