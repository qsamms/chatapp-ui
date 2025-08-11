export function getDisplayName(user) {
  if (user.displayName) {
    return user.displayName;
  }
  return `${user.firstName} ${user.lastName}`;
}
