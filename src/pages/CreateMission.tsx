import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { ArrowLeft, Calendar, FileText, Rocket, Save } from 'lucide-react';
import { Card, Button } from '../components/ui/index';
import type { MissionFormData } from '../types/types';

export const CreateMission = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<MissionFormData>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.startDate ||
      !formData.endDate
    ) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newMissionId = `mission-${Date.now()}`;
      console.log('Creating mission:', { ...formData, id: newMissionId });

      navigate(`/mission/${newMissionId}/crew`);
    }, 1500);
  };

  const handleInputChange = (field: keyof MissionFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isFormValid =
    formData.name.trim() &&
    formData.description.trim() &&
    formData.startDate &&
    formData.endDate &&
    new Date(formData.startDate) < new Date(formData.endDate);

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Mission Control
        </Link>

        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-xl bg-space-100 dark:bg-space-900">
            <Rocket className="h-8 w-8 text-space-600 dark:text-space-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Create New Mission
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Set up a new analog space mission with crew scheduling
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Mission Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-space-500 focus:border-transparent"
                  placeholder="Enter mission name (e.g., Mars Analog Simulation 2025)"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Mission Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-space-500 focus:border-transparent resize-none"
                  placeholder="Describe the mission objectives, scope, and key activities..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    min={today}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-space-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    min={formData.startDate || today}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-space-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
                <Link to="/">
                  <Button type="button" variant="ghost">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={!isFormValid || isSubmitting} size="lg">
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                      Creating Mission...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2 text-white" />
                      Create Mission
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Mission Setup Guide
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-space-100 dark:bg-space-900 flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-space-600 dark:text-space-400">
                    1
                  </span>
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    Basic Information
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    Provide mission name and detailed description
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-space-100 dark:bg-space-900 flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-space-600 dark:text-space-400">
                    2
                  </span>
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">Timeline</p>
                  <p className="text-slate-600 dark:text-slate-400">
                    Set mission start and end dates
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-space-100 dark:bg-space-900 flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-space-600 dark:text-space-400">
                    3
                  </span>
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">Scheduler Setup</p>
                  <p className="text-slate-600 dark:text-slate-400">
                    Add crew members and create activity schedules
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Mission Types
            </h3>
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <p className="font-medium text-slate-900 dark:text-slate-100">ISS Analog</p>
                <p className="text-slate-600 dark:text-slate-400">
                  International Space Station operations simulation
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <p className="font-medium text-slate-900 dark:text-slate-100">Mars Simulation</p>
                <p className="text-slate-600 dark:text-slate-400">
                  Long-duration Mars surface operations
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <p className="font-medium text-slate-900 dark:text-slate-100">Lunar Gateway</p>
                <p className="text-slate-600 dark:text-slate-400">
                  Lunar orbital platform missions
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateMission;
