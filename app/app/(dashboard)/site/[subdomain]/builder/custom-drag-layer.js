import { useDragLayer } from 'react-dnd';

export default function CustomDragLayer() {
  const { isDragging, item, currentOffset } = useDragLayer(monitor => ({
    isDragging: monitor.isDragging(),
    item: monitor.getItem(),
    currentOffset: monitor.getSourceClientOffset(),
  }));

  function getItemStyles(currentOffset) {
    if (!currentOffset) {
      return {
        display: 'none',
      };
    }

    const { x, y } = currentOffset;

    const styles = {
      position: 'fixed',
      pointerEvents: 'none',
      zIndex: 100,
      left: 0,
      top: 0,
      transform: `translate(${x}px, ${y}px)`,
    };

    return styles;
  }

  if (!isDragging) {
    return null;
  }

  return (
    <div style={getItemStyles(currentOffset)}>
      {/* Render the component being dragged */}
    </div>
  );
}
