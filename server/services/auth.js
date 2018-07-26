const mongoose = require('mongoose');
const User = mongoose.model('user');
const Post = mongoose.model('post');
const pick = require('../utils/pick');

const login = async ({ password, username }) => {
  return new Promise((resolve, reject) => {
    return User.findByCredentials(username, password).then(user => {
      if (!user || user === 'Invalid Credentials') {
        return reject(new Error('Invalid Credentials'));
      }
      const token = user
        .generateAuthToken()
        .then(token => resolve(token))
        .catch(err => new Error(err));
    });
  }).catch(err => {
    console.log('Error', err);
    return err;
  });
};

const logout = async (user, token) => {
  try {
    if (!user) throw new Error("You aren't logged in");
    await user.removeToken(token);
    return user;
  } catch (err) {
    console.log('Error', err);
    return err;
  }
};

const signup = async ({ email, password, username, isAFoodTruck }) => {
  try {
    const user = new User({ username, email, password, isAFoodTruck });
    await user.save();

    const token = await user.generateAuthToken();
    return token;
  } catch (err) {
    const errors = [];
    if (err.errors) {
      for (key in err.errors) {
        errors.push(err.errors[key].message);
      }
    } else {
      errors.push(err);
    }
    return Promise.reject(errors);
  }
};

const deleteUser = async user => {
  try {
    await User.findOneAndRemove({ _id: user._id });
    await Post.remove({ _creator: user._id });
    return user._id;
  } catch (err) {
    console.log('Error', err);
    return err;
  }
};

const updateUser = async (args, me) => {
  try {
    const values = pick(args, [
      'bio',
      'email',
      'isAFoodTruck',
      'location',
      'newPassword',
      'profileImg',
      'username',
    ]);

    if (!args.currentPassword) {
      throw new Error('You must enter your password to update your account.');
    } else if (
      !values.username ||
      !values.email ||
      !values.profileImg ||
      !values.bio ||
      !values.location
    ) {
      throw new Error('Missing information');
    }

    const user = await User.findByCredentials(
      me.username.toLowerCase(),
      args.currentPassword
    );

    if (!user || user.err) {
      throw new Error(user.err);
    }

    Object.keys(values).forEach(key => {
      if (key === 'newPassword' && values.newPassword) {
        user.password = values.newPassword;
        return;
      }

      if (user.username !== values.username) {
        user.username_lowercase === values.username.toLowerCase();
      }

      user[key] = values[key];
    });

    await user.save();

    return user;
  } catch (err) {
    console.log(err);
    return err;
  }
};

module.exports = { login, logout, signup, deleteUser, updateUser };
