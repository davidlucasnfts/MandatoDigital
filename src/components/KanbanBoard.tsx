import { useMemo } from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';


interface KanbanColumn {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface KanbanBoardProps<T extends { id: string; status: string }> {
  items: T[];
  columns: KanbanColumn[];
  onDragEnd: (itemId: string, newStatus: string) => void;
  renderCard: (item: T) => React.ReactNode;
  getItemStatus: (item: T) => string;
}

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

export default function KanbanBoard<T extends { id: string; status: string }>({
  items,
  columns,
  onDragEnd,
  renderCard,
  getItemStatus,
}: KanbanBoardProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const itemsByColumn = useMemo(() => {
    const map: Record<string, T[]> = {};
    columns.forEach(col => {
      map[col.id] = items.filter(item => getItemStatus(item) === col.id);
    });
    return map;
  }, [items, columns, getItemStatus]);



  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const itemId = active.id as string;
    const overId = over.id as string;

    // Verifica se dropou em uma coluna ou em um item
    const isColumn = columns.some(c => c.id === overId);
    const newStatus = isColumn ? overId : items.find(i => i.id === overId)?.status;

    if (newStatus && newStatus !== items.find(i => i.id === itemId)?.status) {
      onDragEnd(itemId, newStatus);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map(col => {
          const colItems = itemsByColumn[col.id] || [];
          return (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-50 rounded-lg p-3 min-h-[200px]"
              data-status={col.id}
            >
              <div className="flex items-center gap-2 mb-3 px-1">
                {col.icon && <col.icon className="w-4 h-4 text-slate-500" />}
                <span className="text-sm font-semibold text-slate-700">{col.label}</span>
                <span className="text-xs text-slate-400 ml-auto">{colItems.length}</span>
              </div>

              <SortableContext
                items={colItems.map(i => i.id)}
                strategy={verticalListSortingStrategy}
                id={col.id}
              >
                <div className="space-y-2">
                  {colItems.map(item => (
                    <SortableItem key={item.id} id={item.id}>
                      {renderCard(item)}
                    </SortableItem>
                  ))}
                </div>
              </SortableContext>
            </motion.div>
          );
        })}
      </div>
    </DndContext>
  );
}
