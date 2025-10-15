import { PlaybookHeader } from "./components/PlaybookHeader";
import { TimelineView } from "./components/TimelineView";
import { ActivityLegend } from "./components/ActivityLegend";

export default function App() {
  return (
    <div className="min-h-screen bg-space-950">
      <PlaybookHeader />
      <main className="container mx-auto px-6 py-8 bg-slate-600">
        <TimelineView />
        <ActivityLegend />
      </main>
    </div>
  );
}