
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, Trash2 } from 'lucide-react';
import { Materia } from '@/components/materias/types';

interface Props {
  materia: Materia;
  onRemove: (id: string) => void;
  ordem: number;
}

export const SortableMateriaItem = ({ materia, onRemove, ordem }: Props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: materia.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="mb-2 bg-white">
        <CardContent className="p-3 flex items-center gap-2">
          <Button variant="ghost" size="icon" {...attributes} {...listeners} className="cursor-grab p-2">
            <GripVertical className="h-5 w-5 text-gray-400" />
          </Button>
          <span className="font-mono text-sm text-gray-500">{ordem}.</span>
          <div className="flex-grow">
            <p className="font-semibold text-sm text-gov-blue-800">{materia.protocolo} - <span className="font-normal">{materia.tipo}</span></p>
            <p className="text-xs text-gray-600">{materia.ementa}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onRemove(materia.id)} className="p-2 group">
            <Trash2 className="h-4 w-4 text-gray-400 group-hover:text-red-500" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
