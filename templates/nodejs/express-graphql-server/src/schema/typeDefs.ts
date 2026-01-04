import { gql } from 'graphql-tag';

export const typeDefs = gql`
  directive @auth(requires: Role = USER) on FIELD_DEFINITION

  enum Role {
    USER
    ADMIN
  }

  scalar DateTime

  type Query {
    me: User @auth
    users: [User!]! @auth(requires: ADMIN)
    user(id: ID!): User @auth
    posts(limit: Int, offset: Int): PostConnection!
    post(id: ID!): Post
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload!
    register(input: RegisterInput!): AuthPayload!
    createPost(input: CreatePostInput!): Post! @auth
    updatePost(id: ID!, input: UpdatePostInput!): Post! @auth
    deletePost(id: ID!): Boolean! @auth
  }

  type Subscription {
    postCreated: Post!
    postUpdated(id: ID!): Post!
  }

  type User {
    id: ID!
    email: String!
    name: String!
    role: Role!
    posts: [Post!]!
    createdAt: DateTime!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    published: Boolean!
    author: User!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type PostConnection {
    edges: [Post!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type PageInfo {
    hasNextPage: Boolean!
    endCursor: String
  }

  type AuthPayload {
    user: User!
    accessToken: String!
    refreshToken: String!
  }

  input RegisterInput {
    email: String!
    password: String!
    name: String!
  }

  input CreatePostInput {
    title: String!
    content: String!
    published: Boolean
  }

  input UpdatePostInput {
    title: String
    content: String
    published: Boolean
  }
`;
