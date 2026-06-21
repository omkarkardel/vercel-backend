const ROLE = {
  STUDENT: "student",
  CLUB_ADMIN: "club_admin",
  SUPER_ADMIN: "super_admin"
};

const ROLE_LABEL = {
  [ROLE.STUDENT]: "Student",
  [ROLE.CLUB_ADMIN]: "Club Admin",
  [ROLE.SUPER_ADMIN]: "Super Admin"
};

module.exports = { ROLE, ROLE_LABEL };