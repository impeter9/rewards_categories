const { buildSchema } = require('graphql');

module.exports = buildSchema(`
type Category {
    _id: ID!
    title: String!
    creator: User!
    rewards: [Reward!]
}
type Reward {
    _id: ID!
    title: String!
    creator: User!
}
type Matrix {
    _id: ID!
    creator: User!
    matrix: String!
}
type User {
    _id: ID!
    email: String!
    password: String
    createdRewards: [Reward!]
    createdCategories: [Category!]
}
type AuthData {
    userId: ID!
    token: String!
    tokenExpiration: Int!
}
input RewardInput {
    title: String!
}
input CategoryInput {
    title: String!
}
input UserInput {
    email: String!
    password: String!
}
input MatrixInput {
    matrix: String!
}
type RootQuery {
    rewards: [Reward!]!
    categories: [Category!]!
    matrix: Matrix!
    login(email: String!, password: String!): AuthData!
}
type RootMutation {
    createReward(rewardInput: RewardInput): Reward
    addReward(rewardId: ID!, categoryId: ID!): Category
    createUser(userInput: UserInput): User
    createCategory(categoryInput: CategoryInput): Category
    updateMatrix(matrixInput: MatrixInput): Matrix
}
schema {
    query: RootQuery
    mutation: RootMutation
}
`);