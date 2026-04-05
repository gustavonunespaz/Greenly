import { motion, AnimatePresence } from 'framer-motion'
import { Plus, MoreVertical, Calendar as CalendarIcon, CheckCircle2, Circle, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState, useMemo, useEffect, type DragEvent } from 'react'
import { useTasks } from '@/features/tasks/hooks/useTasks'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { TaskResponseDTO } from '@greenly/shared'
import { cn } from '@/lib/utils'

const COLUMNS = [
  { id: 'A_FAZER', title: 'A Fazer', color: 'bg-slate-500' },
  { id: 'FAZENDO', title: 'Em Andamento', color: 'bg-blue-500' },
  { id: 'CONCLUIDO', title: 'Concluído', color: 'bg-emerald-500' },
] as const

type TaskColumnId = (typeof COLUMNS)[number]['id']

function isTaskColumnId(value: string): value is TaskColumnId {
  return COLUMNS.some((column) => column.id === value)
}

interface TaskKanbanBoardProps {
  showHeader?: boolean
  className?: string
}

export function TaskKanbanBoard({ showHeader = true, className }: TaskKanbanBoardProps) {
  const { tasks, criarTask, atualizarTask, excluirTask } = useTasks()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskResponseDTO | null>(null)
  const [boardTasks, setBoardTasks] = useState<TaskResponseDTO[]>([])
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<{ columnId: TaskColumnId; index: number } | null>(null)
  const [isPersistingOrder, setIsPersistingOrder] = useState(false)
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    status: 'A_FAZER' as TaskColumnId,
    dataPrazo: '',
    cor: '#3b82f6',
  })

  useEffect(() => {
    setBoardTasks(tasks as TaskResponseDTO[])
  }, [tasks])

  const openCreateDialog = (status: TaskColumnId = 'A_FAZER') => {
    setEditingTask(null)
    setFormData({
      titulo: '',
      descricao: '',
      status,
      dataPrazo: new Date().toISOString().split('T')[0],
      cor: '#3b82f6',
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (task: TaskResponseDTO) => {
    setEditingTask(task)
    setFormData({
      titulo: task.titulo,
      descricao: task.descricao || '',
      status: isTaskColumnId(task.status) ? task.status : 'A_FAZER',
      dataPrazo: task.dataPrazo ? new Date(task.dataPrazo).toISOString().split('T')[0] : '',
      cor: task.cor || '#3b82f6',
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.titulo) {
      toast.error("O título é obrigatório")
      return
    }

    try {
      if (editingTask) {
        await atualizarTask({ id: editingTask.id, dto: formData })
        toast.success("Tarefa atualizada")
      } else {
        await criarTask(formData)
        toast.success("Tarefa criada")
      }
      setIsDialogOpen(false)
    } catch {
      toast.error("Erro ao salvar tarefa")
    }
  }

  const moveTask = async (task: TaskResponseDTO, newStatus: TaskColumnId) => {
    try {
      const targetLength = boardTasks.filter((t) => t.status === newStatus).length
      await atualizarTask({ id: task.id, dto: { status: newStatus, posicao: targetLength } })
    } catch {
      toast.error("Erro ao mover tarefa")
    }
  }

  const applyDragMove = (
    sourceTasks: TaskResponseDTO[],
    draggedTaskId: string,
    targetColumnId: TaskColumnId,
    targetIndex: number,
  ): TaskResponseDTO[] => {
    const draggedTask = sourceTasks.find((task) => task.id === draggedTaskId)
    if (!draggedTask) return sourceTasks

    const sourceColumnId = isTaskColumnId(draggedTask.status) ? draggedTask.status : 'A_FAZER'
    const sourceColumnTasksWithDragged = sourceTasks
      .filter((task) => task.status === sourceColumnId)
      .sort((a, b) => (a.posicao ?? 0) - (b.posicao ?? 0))
    const draggedIndexInSource = sourceColumnTasksWithDragged.findIndex((task) => task.id === draggedTaskId)

    const sourceColumnTasks = sourceTasks
      .filter((task) => task.status === sourceColumnId && task.id !== draggedTaskId)
      .sort((a, b) => (a.posicao ?? 0) - (b.posicao ?? 0))

    const targetBaseTasks =
      sourceColumnId === targetColumnId
        ? sourceColumnTasks
        : sourceTasks
            .filter((task) => task.status === targetColumnId)
            .sort((a, b) => (a.posicao ?? 0) - (b.posicao ?? 0))

    let safeIndex = Math.max(0, Math.min(targetIndex, targetBaseTasks.length))
    if (sourceColumnId === targetColumnId && draggedIndexInSource !== -1 && safeIndex > draggedIndexInSource) {
      safeIndex = Math.max(0, safeIndex - 1)
    }
    const movedTask: TaskResponseDTO = {
      ...draggedTask,
      status: targetColumnId,
    }

    const nextTargetTasks = [
      ...targetBaseTasks.slice(0, safeIndex),
      movedTask,
      ...targetBaseTasks.slice(safeIndex),
    ]

    const nextById = new Map<string, TaskResponseDTO>()
    for (const task of sourceTasks) {
      nextById.set(task.id, { ...task })
    }

    const sourceColumnFinal = sourceColumnId === targetColumnId ? nextTargetTasks : sourceColumnTasks
    sourceColumnFinal.forEach((task, index) => {
      nextById.set(task.id, { ...task, status: sourceColumnId, posicao: index })
    })
    nextTargetTasks.forEach((task, index) => {
      nextById.set(task.id, { ...task, status: targetColumnId, posicao: index })
    })

    return Array.from(nextById.values())
  }

  const persistBoardChanges = async (previousTasks: TaskResponseDTO[], nextTasks: TaskResponseDTO[]) => {
    const previousById = new Map(previousTasks.map((task) => [task.id, task]))
    const changed = nextTasks.filter((task) => {
      const previous = previousById.get(task.id)
      if (!previous) return false
      return previous.status !== task.status || (previous.posicao ?? 0) !== (task.posicao ?? 0)
    })

    if (changed.length === 0) return

    setIsPersistingOrder(true)
    try {
      await Promise.all(
        changed.map((task) =>
          atualizarTask({
            id: task.id,
            dto: {
              status: task.status,
              posicao: task.posicao ?? 0,
            },
          }),
        ),
      )
    } catch {
      setBoardTasks(previousTasks)
      toast.error('Não foi possível reordenar os cards. Tente novamente.')
    } finally {
      setIsPersistingOrder(false)
    }
  }

  const handleDropTask = async (columnId: TaskColumnId, index: number) => {
    if (!draggingTaskId) return

    const previous = boardTasks
    const next = applyDragMove(previous, draggingTaskId, columnId, index)
    setBoardTasks(next)
    setDraggingTaskId(null)
    setDropTarget(null)
    await persistBoardChanges(previous, next)
  }

  const getDropIndexFromPointer = (event: DragEvent<HTMLDivElement>, index: number) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const isAfterMiddle = event.clientY > rect.top + rect.height / 2
    return isAfterMiddle ? index + 1 : index
  }

  const tasksByColumn = useMemo(() => {
    return COLUMNS.reduce((acc, col) => {
      acc[col.id] = boardTasks
        .filter((t) => t.status === col.id)
        .sort((a, b) => (a.posicao ?? 0) - (b.posicao ?? 0))
      return acc
    }, {} as Record<TaskColumnId, TaskResponseDTO[]>)
  }, [boardTasks])

  return (
    <div className={cn("h-full flex flex-col p-4 md:p-8 space-y-6 overflow-hidden bg-background", className)}>
      {showHeader && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Quadro de Tarefas</h1>
            <p className="text-muted-foreground">Arraste os cards entre colunas para atualizar o status.</p>
          </div>
          <Button onClick={() => openCreateDialog()} className="gap-2 shadow-lg shadow-primary/20">
            <Plus className="w-5 h-5" />
            Nova Tarefa
          </Button>
        </div>
      )}

      <div className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
        Dica: clique no card para editar. Para mover, arraste e solte acima ou abaixo do card alvo.
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
        {COLUMNS.map((column) => (
          <div
            key={column.id}
            className="flex-shrink-0 w-80 md:w-96 flex flex-col bg-muted/30 rounded-2xl border border-border/50 p-4"
            onDragOver={(e) => {
              e.preventDefault()
              if (!draggingTaskId) return
              const itemsLength = tasksByColumn[column.id]?.length || 0
              setDropTarget({ columnId: column.id, index: itemsLength })
            }}
            onDrop={async (e) => {
              e.preventDefault()
              if (!draggingTaskId) return
              const dropIndex = dropTarget?.columnId === column.id ? dropTarget.index : (tasksByColumn[column.id]?.length || 0)
              await handleDropTask(column.id, dropIndex)
            }}
          >
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${column.color}`} />
                <h2 className="font-semibold text-foreground/90 uppercase tracking-wider text-xs">{column.title}</h2>
                <Badge variant="secondary" className="text-[10px] bg-muted/50 text-muted-foreground border-none">
                  {tasksByColumn[column.id]?.length || 0}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => openCreateDialog(column.id)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
              <AnimatePresence mode="popLayout">
                {tasksByColumn[column.id]?.map((task, index) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ y: -2 }}
                    draggable={!isPersistingOrder}
                    onDragStart={(e) => {
                      setDraggingTaskId(task.id)
                      e.dataTransfer.effectAllowed = 'move'
                      e.dataTransfer.setData('text/plain', task.id)
                    }}
                    onDragEnd={() => {
                      setDraggingTaskId(null)
                      setDropTarget(null)
                    }}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (!draggingTaskId) return
                      const pointerIndex = getDropIndexFromPointer(e, index)
                      setDropTarget({ columnId: column.id, index: pointerIndex })
                    }}
                    onDrop={async (e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      const pointerIndex = getDropIndexFromPointer(e, index)
                      await handleDropTask(column.id, pointerIndex)
                    }}
                    onClick={() => openEditDialog(task)}
                    className={`group relative bg-card hover:bg-accent/50 border rounded-xl p-4 shadow-sm transition-all cursor-pointer ${
                      draggingTaskId === task.id ? 'opacity-50 border-primary/40' : 'border-border/60 hover:border-border'
                    } ${
                      dropTarget?.columnId === column.id && dropTarget.index === index ? 'ring-1 ring-primary/60 ring-offset-1 ring-offset-background' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="text-muted-foreground/50 pt-0.5 cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <div className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: task.cor || '#3b82f6' }} />
                      <h3 className="flex-1 font-medium text-sm text-foreground line-clamp-2 leading-snug">{task.titulo}</h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(task)}>Editar</DropdownMenuItem>
                          {COLUMNS.filter((c) => c.id !== column.id).map((c) => (
                            <DropdownMenuItem key={c.id} onClick={(e) => { e.stopPropagation(); moveTask(task, c.id) }}>
                              Mover para {c.title}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={async (e) => {
                              e.stopPropagation()
                              if (confirm("Excluir tarefa?")) {
                                await excluirTask(task.id)
                                toast.success("Tarefa excluída")
                              }
                            }}
                          >
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {task.descricao && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3 px-2">{task.descricao}</p>
                    )}

                    <div className="flex items-center gap-3 px-2">
                      {task.dataPrazo && (
                        <div className={`flex items-center gap-1.5 text-[10px] font-medium ${
                          new Date(task.dataPrazo) < new Date() && task.status !== 'CONCLUIDO'
                            ? 'text-destructive'
                            : 'text-muted-foreground'
                        }`}>
                          <CalendarIcon className="w-3 h-3" />
                          {format(new Date(task.dataPrazo), 'dd MMM', { locale: ptBR })}
                        </div>
                      )}
                      <div className="flex-1" />
                      {task.status === 'CONCLUIDO' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground/30" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {dropTarget?.columnId === column.id && dropTarget.index === (tasksByColumn[column.id]?.length || 0) && (
                <div className="h-10 rounded-lg border border-dashed border-primary/50 bg-primary/5" />
              )}

              {(!tasksByColumn[column.id] || tasksByColumn[column.id].length === 0) && (
                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border/40 rounded-xl">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Vazio</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
            <DialogDescription>Preencha os detalhes para organizar seu dia.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                placeholder="Ex: Revisar licenciamento cliente X"
                value={formData.titulo}
                onChange={(e) => setFormData((s) => ({ ...s, titulo: e.target.value }))}
                className="bg-muted/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                placeholder="Notas adicionais..."
                className="min-h-[100px] bg-muted/50"
                value={formData.descricao}
                onChange={(e) => setFormData((s) => ({ ...s, descricao: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data">Data Limite</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.dataPrazo}
                  onChange={(e) => setFormData((s) => ({ ...s, dataPrazo: e.target.value }))}
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Cor do Rótulo</Label>
                <div className="flex items-center gap-2 h-10">
                  <input
                    type="color"
                    className="w-8 h-8 rounded border-none bg-transparent cursor-pointer"
                    value={formData.cor}
                    onChange={(e) => setFormData((s) => ({ ...s, cor: e.target.value }))}
                  />
                  <span className="text-xs font-mono text-muted-foreground uppercase">{formData.cor}</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar Tarefa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(120, 120, 120, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(120, 120, 120, 0.2);
        }
      `}</style>
    </div>
  )
}
