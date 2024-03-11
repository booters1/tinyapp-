const getUserByEmail = function(email, usersDatabase) {
  for (const userId in usersDatabase) {
    const user = usersDatabase[userId];
    if (user.email === email) {
      return user;
    }
  }
};

module.exports = { getUserByEmail };