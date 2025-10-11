import { useCallback } from "react"
import { useStore } from "../hooks/useStore"
import dayjs from "dayjs"

export const Sidebar = () => {
  const astronauts = useStore((s) => s.astronauts)
  const set = useStore.setState // access the setter directly

  const addMockTask = useCallback(() => {
    const id = `t-${Math.random().toString(36).slice(2, 8)}`
    const newTask = {
      id,
      title: `New-${id}`,
      start: dayjs().add(1, "hour").toISOString(),
      end: dayjs().add(2, "hour").toISOString(),
      astronautId: null,
      details: "Created from sidebar",
    }

    // ✅ Proper Zustand update (no mutation)
    set((state) => ({ tasks: [...state.tasks, newTask] }))
  }, [set])

  return (
    <aside className="w-80 p-4 border-l bg-white dark:bg-gray-900 h-full">
      <h3 className="font-semibold mb-3">Create task</h3>
      <div className="space-y-2">
        <button
          onClick={addMockTask}
          className="px-3 py-2 rounded shadow-sm bg-sky-600 text-white"
        >
          + Add mock task
        </button>

        <div className="pt-4">
          <h4 className="text-sm font-medium">Astronauts</h4>
          <ul className="mt-2 space-y-2">
            {astronauts.map((a) => (
              <li key={a.id} className="text-sm">
                {a.name}{" "}
                <span className="text-xs opacity-60">{a.role ?? ""}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
