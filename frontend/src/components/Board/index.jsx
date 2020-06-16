import React, { Component } from 'react';
import styled from 'styled-components';

import Source from './Source';
import Target from './Target';
import Modal from '../Modal/Modal';
import './Board.css';

import AuthContext from '../../context/auth-context';

const Grid = styled.div`
    display: grid;
    outerWidth: 100%;
    width: 100%;
    height: 100%;
    margin: 0;
    border-style: double;
    justify-content: center;
    grid-template-columns: ${props => (`repeat(${props.categories.length+1}, 1fr)`)};
    grid-template-rows: ${props => (`repeat(${props.rewards.length+1}, 1fr)`)};
`;

const GridItem = styled.div`
    background-color: ${props => props.color};
    border: 1px solid rgba(0, 0, 0, 0.8);
    text-align: center;
    border-style: none groove;
    justify-content: center;
    align-items: center;
`;

class Board extends Component {
    constructor(props) {
        super(props);
        this.handleDrop = this.handleDrop.bind(this);
        this.state = {
            items: [],
            mat: [],
            pastMat: [],
            futureMat: [],
            savedModal: false,
            isLoading: false
        };
    }
    isActive = true;

    static contextType = AuthContext;

    componentDidMount() {
        this.setState({ isLoading: true });
        const requestBody = {
            query: `
                query {
                    matrix {
                            _id
                            matrix
                        }
                }`
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
            if (this.isActive) {
                if (resData.data.matrix.matrix === "matrixnotfound") {
                    let numCategories = this.props.categories.length;
                    let numRewards = this.props.rewards.length;
                    if (numCategories < 1 || numRewards < 1) return;
                    let mat = new Array(numRewards+1).fill(new Array(numCategories+1).fill(0));
                    let mat0 = new Array(numCategories+1).fill(2);
                    mat[0] = mat0;
                    for (let i=1; i<numRewards+1; i++) {
                        mat[i][0] = 2;
                    }
                    this.createItems(mat, true);
                } else {
                    this.createItems(JSON.parse(resData.data.matrix.matrix), true);
                }
            }
        })
        .catch(err => {
            throw err;
        });
    }

    modalConfirmHandler = () => {
        this.setState({ savedModal: false });
    };
    
    async getSavedMatrix() {
        const requestBody = {
            query: `
                query {
                    matrix {
                            _id
                            matrix
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
              return JSON.parse(resData.data.matrix.matrix)
          })
          .catch(err => {
              console.log(err);
          });
    }

    createItems(mat, first) {
        let numCategories = this.props.categories.length;
        let numRewards = this.props.rewards.length;
        let items = [];
        for (let i=0; i<numCategories+1; i++) {
            if (i === 0) {
                items.push(<GridItem key={i} ></GridItem>)
            } else {
                items.push(<GridItem key={i} color={'rgba(104, 172, 237, 0.8)'}>{this.props.categories[i-1].title}</GridItem>)
            }
        }
        for (let j=1; j<numRewards+1; j++) {
            for (let i=0; i<numCategories+1; i++) {
                if (i === 0) {
                    items.push(
                        <GridItem key={(numCategories+1)*j + i} color={'rgba(244, 172, 105, 0.8)'}>
                            <Source key={(numCategories+1)*j + i} reward_id={this.props.rewards[j-1]._id} 
                            title={this.props.rewards[j-1].title} onDrop={this.handleDrop} />
                        </GridItem>)
                } else if (mat[j] !== undefined && mat[j][i] === 1) {
                    items.push(
                        <GridItem key={(numCategories+1)*j + i} color={'rgba(250, 220, 228, 0.8)'}>
                            <button className="remove__button" onClick={e => {this.handleRemoveReward(e, j, i)}}>X</button>
                            <Source key={(numCategories+1)*j + i} source_col_id={i} reward_id={this.props.rewards[j-1]._id} 
                            title={this.props.rewards[j-1].title} category_id={this.props.categories[i-1]._id} 
                            onDrop={this.handleDrop} />
                        </GridItem>)
                } else {
                    items.push(
                        <GridItem key={(numCategories+1)*j + i}>
                            <Target key={(numCategories+1)*j + i} row_id={j} 
                            col_id={i} reward_id={this.props.rewards[j-1]._id} 
                            category_id={this.props.categories[i-1]._id} />
                        </GridItem>)
                }
            }
        }
        if (first) {
            this.setState({ items, mat, isLoading: false });
        } else {
            const oldMat = JSON.parse(JSON.stringify(this.state.mat));
            const updatedPastMat = [...this.state.pastMat];
            updatedPastMat.push(oldMat);
            this.setState({ items, mat, pastMat:updatedPastMat, isLoading: false });
        }
    }

    handleRemoveReward(e, row_id, source_col_id) {
        e.preventDefault();
        let newMat = JSON.parse(JSON.stringify(this.state.mat));
        newMat[row_id][source_col_id] = 0;
        this.createItems(newMat);
    }

    handleDrop(source_col_id, row_id, col_id) {
        let newMat = JSON.parse(JSON.stringify(this.state.mat));
        newMat[row_id][source_col_id] = 0;
        newMat[row_id][col_id] = 1;
        this.createItems(newMat);
    }

    handleUndo(e) {
        e.preventDefault();
        if (this.state.pastMat.length < 1) return;
        const updatedMat = JSON.parse(JSON.stringify(this.state.pastMat[this.state.pastMat.length - 1]));
        const updatedPastMat = this.state.pastMat.slice(0,-1);
        const updatedFutureMat = [...this.state.futureMat];
        updatedFutureMat.unshift(JSON.parse(JSON.stringify(this.state.mat)));
        let mat = updatedMat;

        let numCategories = this.props.categories.length;
        let numRewards = this.props.rewards.length;
        let items = [];
        for (let i=0; i<numCategories+1; i++) {
            if (i === 0) {
                items.push(<GridItem key={i}></GridItem>)
            } else {
                items.push(<GridItem key={i} color={'rgba(104, 172, 237, 0.8)'}>{this.props.categories[i-1].title}</GridItem>)
            }
        }
        for (let j=1; j<numRewards+1; j++) {
            for (let i=0; i<numCategories+1; i++) {
                if (i === 0) {
                    items.push(
                        <GridItem key={(numCategories+1)*j + i} color={'rgba(244, 172, 105, 0.8)'}>
                            <Source key={(numCategories+1)*j + i} reward_id={this.props.rewards[j-1]._id} 
                            title={this.props.rewards[j-1].title} onDrop={this.handleDrop} />
                        </GridItem>)
                } else if (mat[j] !== undefined && mat[j][i] === 1) {
                    items.push(
                        <GridItem key={(numCategories+1)*j + i} color={'rgba(250, 220, 228, 0.8)'}>
                            <button className="remove__button" onClick={e => {this.handleRemoveReward(e, j, i)}}>X</button>
                            <Source key={(numCategories+1)*j + i} source_col_id={i} reward_id={this.props.rewards[j-1]._id} 
                            title={this.props.rewards[j-1].title} category_id={this.props.categories[i-1]._id} 
                            onDrop={this.handleDrop} />
                        </GridItem>)
                } else {
                    items.push(
                        <GridItem key={(numCategories+1)*j + i}>
                            <Target key={(numCategories+1)*j + i} row_id={j} 
                            col_id={i} reward_id={this.props.rewards[j-1]._id} 
                            category_id={this.props.categories[i-1]._id} />
                        </GridItem>)
                }
            }
        }
        this.setState({ items, mat, pastMat:updatedPastMat, futureMat:updatedFutureMat });
    }

    handleRedo(e) {
        e.preventDefault();
        if (this.state.futureMat.length < 1) return;
        const updatedMat = JSON.parse(JSON.stringify(this.state.futureMat[0]));
        const updatedFutureMat = this.state.futureMat.slice(1,);
        const updatedPastMat = [...this.state.pastMat];
        updatedPastMat.push(JSON.parse(JSON.stringify(this.state.mat)));

        let mat = updatedMat;

        let numCategories = this.props.categories.length;
        let numRewards = this.props.rewards.length;
        let items = [];
        for (let i=0; i<numCategories+1; i++) {
            if (i === 0) {
                items.push(<GridItem key={i}></GridItem>)
            } else {
                items.push(<GridItem key={i} color={'rgba(104, 172, 237, 0.8)'}>{this.props.categories[i-1].title}</GridItem>)
            }
        }
        for (let j=1; j<numRewards+1; j++) {
            for (let i=0; i<numCategories+1; i++) {
                if (i === 0) {
                    items.push(
                        <GridItem key={(numCategories+1)*j + i} color={'rgba(244, 172, 105, 0.8)'}>
                            <Source key={(numCategories+1)*j + i} reward_id={this.props.rewards[j-1]._id} 
                            title={this.props.rewards[j-1].title} onDrop={this.handleDrop} />
                        </GridItem>)
                } else if (mat[j] !== undefined && mat[j][i] === 1) {
                    items.push(
                        <GridItem key={(numCategories+1)*j + i} color={'rgba(250, 220, 228, 0.8)'}>
                            <button className="remove__button" onClick={e => {this.handleRemoveReward(e, j, i)}}>X</button>
                            <Source key={(numCategories+1)*j + i} source_col_id={i} reward_id={this.props.rewards[j-1]._id} 
                            title={this.props.rewards[j-1].title} category_id={this.props.categories[i-1]._id} 
                            onDrop={this.handleDrop} />
                        </GridItem>)
                } else {
                    items.push(
                        <GridItem key={(numCategories+1)*j + i}>
                            <Target key={(numCategories+1)*j + i} row_id={j} 
                            col_id={i} reward_id={this.props.rewards[j-1]._id} 
                            category_id={this.props.categories[i-1]._id} />
                        </GridItem>)
                }
            }
        }
        this.setState({ items, mat, pastMat:updatedPastMat, futureMat:updatedFutureMat });
    }

    handleSave(e) {
        e.preventDefault();
        const requestBody = {
            query: `
                mutation {
                    updateMatrix(matrixInput: {matrix: "${JSON.stringify(this.state.mat)}"}){
                            _id
                            matrix
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
            this.setState({savedModal: true});
            return resData;
          })
          .catch(err => {
              console.log(err);
          });
    }

    componentWillUnmount() {
        this.isActive = false;
    }

    render() {
        return (
                <div className="board">
                    {this.state.savedModal && (
                    <Modal
                        title="Rewards Saved"
                        canConfirm
                        onConfirm={this.modalConfirmHandler}>
                    </Modal>
                    )}
                    <div>
                        <button onClick={this.handleUndo.bind(this)} className="btn" id="save">Undo</button>
                        <button onClick={this.handleRedo.bind(this)} className="btn" id="save">Redo</button>
                        <button onClick={this.handleSave.bind(this)} className="btn" id="save">Save</button>
                    </div>
                    {this.state.isLoading && <div></div>}
                    {(!this.state.isLoading && this.state.items.length === 0) && <div>Please create more Rewards or Categories</div>}
                    {(!this.state.isLoading && this.state.items.length !== 0) && 
                        <Grid categories={this.props.categories} rewards={this.props.rewards}>
                            {this.state.items}
                        </Grid>}
                </div>
            );
    }
}

export default Board;