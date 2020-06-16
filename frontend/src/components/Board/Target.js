import React from 'react';
import { DropTarget } from 'react-dnd';
import { ITEM } from './itemTypes';

const Target = ({ rewreward_id, category_id, connectDropTarget, highlighted }) => (
  connectDropTarget(
    <div
      rewreward_id={rewreward_id}
      category_id={category_id}
      className={`board__targets__target`}
    />
  )
);

const target = {
  drop(props) {
    const { row_id, col_id } = props;
    return ({
        row_id,
        col_id
    });
  }
}

const collect = (connect,  monitor) => ({
  connectDropTarget: connect.dropTarget(),
  highlighted: monitor.canDrop(),
});

export default DropTarget(ITEM, target, collect)(Target);