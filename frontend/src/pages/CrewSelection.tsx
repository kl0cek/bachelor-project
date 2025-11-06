import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { ArrowLeft, UserPlus, Trash2, Rocket, Loader2, AlertCircle } from 'lucide-react';
import { Card, Button } from '../components/ui/index';
import { useMissions } from '../hooks/useMissions';
import { useCrew } from '../hooks/useCrew';
import type { Mission } from '../types/types';

interface CrewMemberForm {
  id: string;
  name: string;
  role: string;
  email: string;
}

export const CrewSelection = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getMissionById } = useMissions();
  const { crew, createCrewMember, deleteCrewMember } = useCrew(id);

  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [crewMembers, setCrewMembers] = useState<CrewMemberForm[]>([
    { id: 'temp-1', name: '', role: '', email: '' },
  ]);

  useEffect(() => {
    const loadMission = async () => {
      if (!id) {
        setError('Mission ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const missionData = await getMissionById(id);
        setMission(missionData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load mission';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadMission();
  }, [id]);

  useEffect(() => {
    if (crew.length > 0) {
      setCrewMembers(
        crew.map((member) => ({
          id: member.id,
          name: member.name,
          role: member.role || '',
          email: member.email || '',
        }))
      );
    }
  }, [crew]);

  const addCrewMember = () => {
    const newId = `temp-${Date.now()}`;
    setCrewMembers([...crewMembers, { id: newId, name: '', role: '', email: '' }]);
  };

  const removeCrewMember = async (memberId: string) => {
    if (crewMembers.length <= 1) return;

    if (memberId.startsWith('temp-')) {
      setCrewMembers(crewMembers.filter((member) => member.id !== memberId));
    } else {
      try {
        await deleteCrewMember(memberId);
        setCrewMembers(crewMembers.filter((member) => member.id !== memberId));
      } catch (err) {
        console.error('Error deleting crew member:', err);
      }
    }
  };

  const updateCrewMember = (memberId: string, field: keyof CrewMemberForm, value: string) => {
    setCrewMembers(
      crewMembers.map((member) => (member.id === memberId ? { ...member, [field]: value } : member))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validMembers = crewMembers.filter((member) => member.name.trim());

    if (validMembers.length === 0) {
      alert('Please add at least one crew member');
      return;
    }

    if (!mission) {
      alert('Mission not found');
      return;
    }

    setIsSubmitting(true);

    try {
      for (const member of validMembers) {
        if (member.id.startsWith('temp-')) {
          await createCrewMember({
            mission_id: mission.id,
            name: member.name,
            role: member.role || undefined,
            email: member.email || undefined,
          });
        }
      }

      navigate(`/mission/${mission.id}/scheduler`);
    } catch (err) {
      console.error('Error creating crew members:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create crew members';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-space-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading mission...</p>
        </div>
      </div>
    );
  }

  if (error || !mission) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Mission Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {error || 'The requested mission could not be found.'}
          </p>
          <Link to="/">
            <Button>Return to Mission Control</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="container mx-auto px-6 max-w-4xl">
        <Link
          to="/"
          className="inline-flex items-center text-space-600 dark:text-space-400 hover:underline mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Mission Control
        </Link>

        <Card className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Crew Selection
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Add crew members for: <span className="font-semibold">{mission.name}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {crewMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col sm:flex-row gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg"
                >
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => updateCrewMember(member.id, 'name', e.target.value)}
                        placeholder="Enter crew member name"
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-space-500"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Role
                        </label>
                        <input
                          type="text"
                          value={member.role}
                          onChange={(e) => updateCrewMember(member.id, 'role', e.target.value)}
                          placeholder="e.g., Commander, Engineer"
                          className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-space-500"
                          disabled={isSubmitting}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={member.email}
                          onChange={(e) => updateCrewMember(member.id, 'email', e.target.value)}
                          placeholder="email@example.com"
                          className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-space-500"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>

                  {crewMembers.length > 1 && (
                    <div className="flex items-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCrewMember(member.id)}
                        disabled={isSubmitting}
                        className="text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={addCrewMember}
              disabled={isSubmitting}
              className="w-full"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Another Crew Member
            </Button>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4 mr-2" />
                    Continue to Scheduler
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CrewSelection;
