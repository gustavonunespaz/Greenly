import { AppLayout } from '@/components/layout/AppLayout'
import { useTrackViewLoaded } from '@/hooks/use-track-view-loaded'
import { TaskKanbanBoard } from '@/features/tasks/components/TaskKanbanBoard'

export default function TasksPage() {
  useTrackViewLoaded('tasks')

  return (
    <AppLayout title="Tarefas">
      <TaskKanbanBoard showHeader />
    </AppLayout>
  )
}

