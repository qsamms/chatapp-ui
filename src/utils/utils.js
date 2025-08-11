export function getDisplayName(user) {
  if (user.displayName) {
    return user.displayName;
  }
  return `${user.firstName} ${user.lastName}`;
}

export function isUserOnline(lastHeartbeat) {
  if (!lastHeartbeat) return false;

  const last = new Date(lastHeartbeat).getTime();
  const now = Date.now();
  const diff = now - last;

  return diff < 60_000;
}
