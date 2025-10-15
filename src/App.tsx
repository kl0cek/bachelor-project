import { PlaybookHeader } from './components/PlaybookHeader';
import { TimelineView } from './components/TimelineView';
import { ActivityLegend } from './components/ActivityLegend';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-800">
      <PlaybookHeader />
      <main className="container mx-auto px-6 py-8">
        <TimelineView />
        <ActivityLegend />
      </main>
    </div>
  );
}
