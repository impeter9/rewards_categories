import React from 'react';
import { DragSource } from 'react-dnd';
import { ITEM } from './itemTypes';

const Source = ({ reward_id, title, connectDragSource, isDragging }) => (
  connectDragSource(
    <div
    reward_id={reward_id}
     className="board__sources__source"
     style={{
       opacity: isDragging ? 0.25 : 1,
     }}>{title}</div>
  )
);

const source = {
  beginDrag(props) {
    const { source_col_id} = props;
    return ({
        source_col_id
    });
  },
  endDrag(props, monitor) {
    if (!monitor.didDrop()) {
      return;
    }
    const { onDrop } = props;
    const { source_col_id } = monitor.getItem();
    const { row_id, col_id } = monitor.getDropResult();
    onDrop(source_col_id, row_id, col_id);
  },
};

const collect = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
});

export default DragSource(ITEM, source, collect)(Source);