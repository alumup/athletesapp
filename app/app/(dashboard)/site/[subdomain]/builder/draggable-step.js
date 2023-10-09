import { cloneElement } from 'react';
import { useDrag } from 'react-dnd';

export default function DraggableStep(props) {
  console.log("draggable steps", props)
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: 'form',
    item: { id: props.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return cloneElement(props.component, {ref: dragRef})
}
