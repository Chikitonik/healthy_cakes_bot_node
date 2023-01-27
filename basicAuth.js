const ROLES = {
  ADMIN: 1,
  CUSTOMER: 2,
  COURIER: 3,
  BAKER: 4,
};

function authUser(req, res, next) {
  console.log("req.body :>> ", req.body);
  if (req.body.user == null) {
    res.status(403);
    return res.send("You need to sign in");
  }
  next();
}

function authRole(role) {
  return (req, res, next) => {
    if (req.body.user.role !== role) {
      res.status(401);
      return res.send("Not allowed");
    }

    next();
  };
}

module.exports = {
  authUser,
  authRole,
  ROLES: ROLES,
};
