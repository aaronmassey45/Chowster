const mongoose = require('mongoose');
const graphql = require('graphql');
const UserType = require('./userType');
const User = mongoose.model('user');
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList,
  GraphQLInt,
} = graphql;

const PostType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: GraphQLID },
    text: { type: GraphQLString },
    timeCreated: { type: GraphQLInt },
    _creator: {
      type: UserType,
      resolve(parentValue) {
        return User.findById(parentValue._creator);
      },
    },
    likedBy: {
      type: new GraphQLList(UserType),
      resolve(parentValue) {
        return parentValue.likedBy.map(user => User.findById(user));
      },
    },
    location: {
      type: new GraphQLObjectType({
        name: 'PostLocation',
        fields: () => ({
          lat: { type: GraphQLInt },
          lng: { type: GraphQLInt },
        }),
      }),
    },
  }),
});

module.exports = PostType;