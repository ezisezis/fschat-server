const isUsernameValid = username => {
  return /^\S{2,20}$/.test(username);
};

const usernameTaken = (connectedUsers, username) => {
  let taken = false;
  connectedUsers.forEach(key => {
    const index = key.indexOf("__");
    const usernameFromCache = key.substr(index + 2);
    if (usernameFromCache === username) {
      taken = true;
    }
  });
  return taken;
};

module.exports = {
  isUsernameValid,
  usernameTaken
};
