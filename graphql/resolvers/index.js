const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Reward = require('../../models/reward');
const User = require('../../models/user');
const Category = require('../../models/category');
const Matrix = require('../../models/matrix');

const rewards = async rewardIds => {
    try {
        const rewards = await Reward.find({ _id: { $in: rewardIds } });
        return rewards.map(reward => {
            return {
            ...reward._doc,
            creator: user.bind(this, reward._doc.creator)
            };
        });
    } catch (err) {
        throw err;
    }
};

const categories = async categoryIds => {
    try {
        const categories = await Category.find({ _id: { $in: categoryIds } });
        return categories.map(category => {
            return {
                ...category._doc,
                creator: user.bind(this, category._doc.creator),
                rewards: rewards.bind(this, category._doc.rewards)
            };
        });
    } catch (err) {
        throw err;
    }
};

const user = async userId => {
  try {
    const user = await User.findById(userId);
    return {
    ...user._doc,
    createdRewards: rewards.bind(this, user._doc.createdRewards),
    createdCategories: categories.bind(this, user._doc.createdCategories)
    };
  } catch (err) {
    throw err;
  }
};

module.exports = {
    rewards: async (args, req) => {
        if (!req.isAuth) {
          throw new Error('Unauthenticated!');
        }
        try {
            const rewards = await Reward.find({ creator: req.userId });
            return rewards.map(reward => {
                return { 
                    ...reward._doc,
                    creator: user.bind(this, reward._doc.creator)
                };
            });
        } catch (err) {
            throw err;
        }
    },
    categories: async (args, req) => {
        if (!req.isAuth) {
          throw new Error('Unauthenticated!');
        }
        try {
            const categories = await Category.find({ creator: req.userId });
            return categories.map(category => {
                return {
                ...category._doc,
                creator: user.bind(this, category._doc.creator)
                };
            });
        } catch (err) {
            throw err;
        }
    },
    matrix: async (args, req) => {
        if (!req.isAuth) {
          throw new Error('Unauthenticated!');
        }
        try {
            const matrix = await Matrix.findOne({ creator: req.userId });
            if (!matrix) return {
                _id: 'matrixnotfound',
                creator: 'matrixnotfound',
                matrix: 'matrixnotfound'
            };
            return {
                ...matrix._doc,
                creator: user.bind(this, matrix._doc.creator)
            };
        } catch (err) {
            throw err;
        }
    },
    login: async ({ email, password }) => {
        const user = await User.findOne({ email: email });
        if (!user) {
            throw new Error('User does not exist!');
        }
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            throw new Error('Password is incorrect!');
        }
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            'somesupersecretkey',
            {
            expiresIn: '1h'
            }
        );
        return { userId: user.id, token: token, tokenExpiration: 1 };
    },
    createReward: async (args, req) => {
        if (!req.isAuth) {
          throw new Error('Unauthenticated!');
        }
        const reward = new Reward({
            title: args.rewardInput.title,
            creator: req.userId
        });
        let createdReward;
        try {
            const result = await reward.save();
            createdReward = { 
                ...result._doc,
                creator: user.bind(this, result._doc.creator)
            };
            const creator = await User.findById(req.userId);
            if (!creator) {
                throw new Error('User not found.');
            }
            creator.createdRewards.push(reward);
            await creator.save();
            return createdReward;
        } catch (err) {
            throw err;
        }
    },
    addReward: async (args, req) => {
        if (!req.isAuth) {
          throw new Error('Unauthenticated!');
        }
        try {
            const fetchedCategory = await Category.findOne({ _id: args.categoryId });
            const fetchedReward = await Reward.findOne( { _id: args.rewardId });
            fetchedCategory.rewards.push(fetchedReward);
            await fetchedCategory.save();
            return fetchedCategory;
        } catch (err) {
            throw err;
        }
    },
    createUser: async args => {
        try {
            const existingUser = await User.findOne({ email: args.userInput.email });
            if (existingUser) {
                throw new Error('User exists already.');
            }
            const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
            const user = new User({
                email: args.userInput.email,
                password: hashedPassword
            });
            const result = await user.save();
            return { ...result._doc, password: null};
        } catch (err) {
            throw err;
        }
    },
    createCategory: async (args, req) => {
        if (!req.isAuth) {
          throw new Error('Unauthenticated!');
        }
        const category = new Category({
            title: args.categoryInput.title,
            creator: req.userId
        });
        let createdCategory;
        try {
            const result = await category.save();
            createdCategory = {
                ...result._doc,
                creator: user.bind(this, result._doc.creator)
            };
            const creator = await User.findById(req.userId);
            if (!creator) {
                throw new Error('User not found.');
            }
            creator.createdCategories.push(category);
            await creator.save();
            return createdCategory;
        } catch (Err) {
            console.log(err);
            throw err;
        }
    },
    updateMatrix: async (args, req) => {
        if (!req.isAuth) {
          throw new Error('Unauthenticated!');
        }
        let createdMatrix;
        try {
            await Matrix.update({ creator: req.userId }, {matrix: args.matrixInput.matrix}, { upsert : true });
            const result = await Matrix.findOne({ creator: req.userId });
            createdMatrix = {
                ...result._doc,
                creator: user.bind(this, result._doc.creator)
            };
            return createdMatrix;
        } catch (Err) {
            console.log(err);
            throw err;
        }
    }
}