const getUserByEmail = function(email, usersDatabase) {
  for (const userId in usersDatabase) {
    const user = usersDatabase[userId];
    if (user.email === email) {
      return user;
    }
  }
  return undefined; // Return undefined if user not found
};

module.exports = { getUserByEmail };