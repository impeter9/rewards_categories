import React, { Component } from 'react';

import Modal from '../components/Modal/Modal';
import Backdrop from '../components/Backdrop/Backdrop';
import Spinner from '../components/Spinner/Spinner';
import Board from '../components/Board';
import { DndProvider } from "react-dnd";
import { HTML5Backend } from 'react-dnd-html5-backend';

import { connect } from 'react-redux';
import { getRewards, updateRewards } from '../actions/rewardsActions';
import { getCategories, updateCategories } from '../actions/categoriesActions';

import AuthContext from '../context/auth-context';

import './Rewards.css';

class RewardsPage extends Component {
    state = {
        creating: false,
        creatingCat: false,
        isLoading: false
    };
    isActive = true;

    static contextType = AuthContext;

    constructor(props) {
        super(props);
        this.titleElRef = React.createRef();
        this.titleElRefCat = React.createRef();
    }

    componentDidMount() {
        this.props.getRewards();
        this.props.getCategories();
        this.fetchRewards();
        this.fetchCategories();
    }

    startCreateRewardHandler = () => {
        this.setState({ creating: true });
    };

    startCreateCategoryHandler = () => {
        this.setState({ creatingCat: true });
    };

    modalCancelHandler = () => {
        this.setState({ creating: false });
    };

    modalCancelHandlerCat = () => {
        this.setState({ creatingCat: false });
    };

    modalConfirmHandler = () => {
        this.setState({ creating: false, isLoading: true });
        const title = this.titleElRef.current.value;
        if (title.trim().length === 0) return;

        const requestBody = {
            query: `
                mutation {
                        createReward(rewardInput: {title: "${title}"}) {
                            _id
                            title
                    }
                }
              `
            };
        fetch('/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + this.context.token
                }
            })
            .then(res => {
                if (res.status !== 200 && res.status !== 201) {
                throw new Error('Failed!');
                }
                return res.json();
            })
            .then(resData => {
                const updatedRewards = [...this.props.rewards.rewards];
                updatedRewards.push({
                    _id: resData.data.createReward._id,
                    title: resData.data.createReward.title,
                    creator: {
                    _id: this.context.userId
                    }
                });
                this.props.updateRewards(updatedRewards);
                this.setState({ isLoading: false });
            })
            .catch(err => {
                console.log(err);
                this.setState({ isLoading: false });
            });
    };

    modalConfirmHandlerCat = () => {
        this.setState({ creatingCat: false, isLoading: true });
        const title = this.titleElRefCat.current.value;
        if (title.trim().length === 0) return;

        const requestBody = {
            query: `
                mutation {
                    createCategory(categoryInput: {title: "${title}"}) {
                        _id
                        title
                    }
                }
              `
            };
        fetch('/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + this.context.token
                }
            })
            .then(res => {
                if (res.status !== 200 && res.status !== 201) {
                throw new Error('Failed!');
                }
                return res.json();
            })
            .then(resData => {
                const updatedCategories = [...this.props.categories.categories];
                updatedCategories.push({
                    _id: resData.data.createCategory._id,
                    title: resData.data.createCategory.title,
                    creator: {
                    _id: this.context.userId
                    }
                });
                this.props.updateCategories(updatedCategories);
                this.setState({ isLoading: false });
            })
            .catch(err => {
                console.log(err);
                this.setState({ isLoading: false });
            });
    };

    fetchRewards() {
        this.setState({ isLoading: true });
        const requestBody = {
          query: `
                query {
                    rewards {
                        _id
                        title
                    }
                }
            `
        };
    
        fetch('/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + this.context.token
            }
        })
        .then(res => {
            if (res.status !== 200 && res.status !== 201) {
                throw new Error('Failed!');
            }
            return res.json();
        })
        .then(resData => {
            const rewards = resData.data.rewards;
            if (this.isActive) {
                this.props.updateRewards(rewards);
                // this.setState({ isLoading: false });
            }
        })
        .catch(err => {
            console.log(err);
            if (this.isActive) {
                this.setState({ isLoading: false });
            }
        });
    }

    fetchCategories() {
        const requestBody = {
          query: `
                query {
                    categories {
                        _id
                        title
                        rewards {
                            _id
                        }
                    }
                }
            `
        };
    
        fetch('/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + this.context.token
            }
        })
        .then(res => {
            if (res.status !== 200 && res.status !== 201) {
                throw new Error('Failed!');
            }
            return res.json();
        })
        .then(resData => {
            const categories = resData.data.categories;
            if (this.isActive) {
                this.props.updateCategories(categories);
                this.setState({ isLoading: false });
            }
        })
        .catch(err => {
            console.log(err);
            if (this.isActive) {
                this.setState({ isLoading: false });
            }
        });
    }

    componentWillUnmount() {
        this.isActive = false;
    }

    render() {
        const { rewards } = this.props.rewards;
        const { categories } = this.props.categories;
        return (
        <React.Fragment>
            {this.state.creating && <Backdrop />}
            {this.state.creating && (
            <Modal
                title="Add Reward"
                canCancel
                canConfirm
                onCancel={this.modalCancelHandler}
                onConfirm={this.modalConfirmHandler}
            >
            <form>
              <div className="form-control">
                <label htmlFor="title">Title</label>
                <input type="text" id="title" ref={this.titleElRef} />
              </div>
            </form>
            </Modal>
            )}
            {this.state.creatingCat && <Backdrop />}
            {this.state.creatingCat && (
            <Modal
                title="Add Category"
                canCancel
                canConfirm
                onCancel={this.modalCancelHandlerCat}
                onConfirm={this.modalConfirmHandlerCat}
            >
            <form>
              <div className="form-control">
                <label htmlFor="title">Title</label>
                <input type="text" id="title" ref={this.titleElRefCat} />
              </div>
            </form>
            </Modal>
            )}
            {this.context.token && (
            <div className="rewards-control">
                <button className="btn" onClick={this.startCreateRewardHandler}>
                Create Reward
                </button>
                <button className="btn" onClick={this.startCreateCategoryHandler}>
                Create Category
                </button>
            </div>
            )}
            {this.state.isLoading ? (
                <Spinner />
            ) : (
                <DndProvider backend={HTML5Backend}>
                    <Board rewards={rewards} categories={categories} />
                </DndProvider>
            )}
        </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => ({
    rewards: state.rewards,
    categories: state.categories
});

export default connect(mapStateToProps, { getRewards, updateRewards, getCategories, updateCategories })(RewardsPage);