import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { getToolMode, type ToolDefinition } from '@/features/types'
import { useAppStore } from '@/store/appStore'

export function useOpenTool(onBackendGate: (tool: ToolDefinition) => void) {
  const navigate = useNavigate()
  const isBackendConnected = useAppStore((s) => s.isBackendConnected)

  return (tool: ToolDefinition) => {
    if (getToolMode(tool) === 'backend' && !isBackendConnected) {
      onBackendGate(tool)
      return
    }
    navigate(ROUTES.tool(tool.id))
  }
}
