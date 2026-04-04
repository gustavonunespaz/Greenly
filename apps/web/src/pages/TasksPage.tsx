import { AppLayout } from '@/components/layout/AppLayout'
import { useTrackViewLoaded } from '@/hooks/use-track-view-loaded'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  MoreVertical, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  Circle,
  GripVertical,
  Trash2,
  Tag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState, useMemo } from 'react'
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

const COLUMNS = [
  { id: 'A_FAZER', title: 'A Fazer', color: 'bg-slate-500' },
  { id: 'FAZENDO', title: 'Em Andamento', color: 'bg-blue-500' },
  { id: 'CONCLUIDO', title: 'Concluído', color: 'bg-emerald-500' },
]

export default function TasksPage() {
  useTrackViewLoaded('tasks')
  const { tasks, criarTask, atualizarTask, excluirTask, isLoading } = useTasks()
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<any>(null)
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    status: 'A_FAZER',
    dataPrazo: '',
    cor: '#3b82f6'
  })

  const openCreateDialog = (status = 'A_FAZER') => {
    setEditingTask(null)
    setFormData({
      titulo: '',
      descricao: '',
      status,
      dataPrazo: new Date().toISOString().split('T')[0],
      cor: '#3b82f6'
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (task: any) => {
    setEditingTask(task)
    setFormData({
      titulo: task.titulo,
      descricao: task.descricao || '',
      status: task.status,
      dataPrazo: task.dataPrazo ? new Date(task.dataPrazo).toISOString().split('T')[0] : '',
      cor: task.cor || '#3b82f6'
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
    } catch (e) {
      toast.error("Erro ao salvar tarefa")
    }
  }

  const moveTask = async (task: any, newStatus: string) => {
    try {
      await atualizarTask({ id: task.id, dto: { status: newStatus } })
    } catch (e) {
      toast.error("Erro ao mover tarefa")
    }
  }

  const tasksByColumn = useMemo(() => {
    return COLUMNS.reduce((acc, col) => {
      acc[col.id] = tasks.filter(t => t.status === col.id)
      return acc
    }, {} as Record<string, any[]>)
  }, [tasks])

  return (
    <AppLayout>
      <div className="h-full flex flex-col p-4 md:p-8 space-y-6 overflow-hidden bg-background">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Minhas Tarefas</h1>
            <p className="text-muted-foreground">Organize seu dia e gerencie suas obrigações pessoais.</p>
          </div>
          <Button onClick={() => openCreateDialog()} className="gap-2 shadow-lg shadow-primary/20">
            <Plus className="w-5 h-5" />
            Nova Tarefa
          </Button>
        </div>

        {/* Board */}
        <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
          {COLUMNS.map(column => (
            <div 
              key={column.id} 
              className="flex-shrink-0 w-80 md:w-96 flex flex-col bg-muted/30 rounded-2xl border border-border/50 p-4"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${column.color}`} />
                  <h2 className="font-semibold text-foreground/90 uppercase tracking-wider text-xs">
                    {column.title}
                  </h2>
                  <Badge variant="secondary" className="text-[10px] bg-muted/50 text-muted-foreground border-none">
                    {tasksByColumn[column.id]?.length || 0}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => openCreateDialog(column.id)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Task List */}
              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                <AnimatePresence mode="popLayout">
                  {tasksByColumn[column.id]?.map(task => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ y: -2 }}
                      onClick={() => openEditDialog(task)}
                      className="group relative bg-card hover:bg-accent/50 border border-border/60 hover:border-border rounded-xl p-4 shadow-sm transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: task.cor || '#3b82f6' }} />
                        <h3 className="flex-1 font-medium text-sm text-foreground line-clamp-2 leading-snug">
                          {task.titulo}
                        </h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(task)}>Editar</DropdownMenuItem>
                            {COLUMNS.filter(c => c.id !== column.id).map(c => (
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
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 px-2">
                          {task.descricao}
                        </p>
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

                {(!tasksByColumn[column.id] || tasksByColumn[column.id].length === 0) && (
                  <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border/40 rounded-xl">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Vazio</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dialog Criar/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
            <DialogDescription>
              Preencha os detalhes para organizar seu dia.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input 
                id="titulo" 
                placeholder="Ex: Revisar licenciamento cliente X" 
                value={formData.titulo}
                onChange={e => setFormData(s => ({ ...s, titulo: e.target.value }))}
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
                onChange={e => setFormData(s => ({ ...s, descricao: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data">Data Limite</Label>
                <Input 
                  id="data" 
                  type="date" 
                  value={formData.dataPrazo}
                  onChange={e => setFormData(s => ({ ...s, dataPrazo: e.target.value }))}
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
                    onChange={e => setFormData(s => ({ ...s, cor: e.target.value }))}
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
    </AppLayout>
  )
}
