import { useState } from 'react'
import { CATEGORY_ORDER } from '@/features/types'
import { getToolsByCategory } from '@/features/registry'
import { ToolCard } from '@/components/ToolCard'
import { BackendGateModal } from '@/components/BackendGateModal'
import type { ToolDefinition } from '@/features/types'

export function Dashboard() {
  const grouped = getToolsByCategory()
  const [gateTool, setGateTool] = useState<ToolDefinition | null>(null)

  return (
    <>
      <div className="mb-8 space-y-2">
        <h1 className="font-display text-3xl font-light tracking-tight">PDF Tools</h1>
        <p className="text-muted-foreground">
          Free, open-source PDF utilities. Works in your browser — connect the local backend for
          advanced features.
        </p>
      </div>

      <div className="space-y-10">
        {CATEGORY_ORDER.map((category) => {
          const tools = grouped.get(category)
          if (!tools?.length) return null
          return (
            <section key={category}>
              <h2 className="mb-4 font-display text-lg font-normal">{category}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} onBackendGate={setGateTool} />
                ))}
              </div>
            </section>
          )
        })}
      </div>

      <BackendGateModal
        open={gateTool !== null}
        onOpenChange={(open) => !open && setGateTool(null)}
        toolName={gateTool?.name}
      />
    </>
  )
}
