import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { ArrowLeft, UserPlus, Trash2, Rocket, Loader2, AlertCircle, Save } from 'lucide-react';
import { Card, Button } from '../components/ui/index';
import { useMissions } from '../hooks/useMissions';
import { useCrew } from '../hooks/useCrew';
import type { Mission } from '../types/types';

interface CrewMemberForm {
  id: string;
  name: string;
  role: string;
  email: string;
  isNew: boolean;
  isModified: boolean;
}

export const CrewSelection = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getMissionById } = useMissions();
  const { crew, createCrewMember, updateCrewMember, deleteCrewMember, loading: crewLoading } = useCrew(id);

  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [crewMembers, setCrewMembers] = useState<CrewMemberForm[]>([
    { id: 'temp-1', name: '', role: '', email: '', isNew: true, isModified: false },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (crew.length > 0) {
      setCrewMembers(
        crew.map((member) => ({
          id: member.id,
          name: member.name,
          role: member.role || '',
          email: member.email || '',
          isNew: false,
          isModified: false,
        }))
      );
    } else if (!crewLoading && crew.length === 0) {
      // If no crew members exist, show one empty form
      setCrewMembers([
        { id: 'temp-1', name: '', role: '', email: '', isNew: true, isModified: false },
      ]);
    }
  }, [crew, crewLoading]);

  const addCrewMember = () => {
    const newId = `temp-${Date.now()}`;
    setCrewMembers([...crewMembers, { id: newId, name: '', role: '', email: '', isNew: true, isModified: false }]);
  };

  const removeCrewMember = async (memberId: string, isNew: boolean) => {
    if (isNew) {
      // Just remove from local state if it's a new member
      setCrewMembers(crewMembers.filter((member) => member.id !== memberId));
    } else {
      // Delete from backend if it's an existing member
      if (window.confirm('Are you sure you want to remove this crew member?')) {
        try {
          await deleteCrewMember(memberId);
          setCrewMembers(crewMembers.filter((member) => member.id !== memberId));
          setSuccessMessage('Crew member removed successfully');
          setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
          console.error('Error deleting crew member:', err);
          alert('Failed to remove crew member');
        }
      }
    }
  };

  const updateCrewMemberField = (memberId: string, field: keyof CrewMemberForm, value: string) => {
    setCrewMembers(
      crewMembers.map((member) => 
        member.id === memberId 
          ? { ...member, [field]: value, isModified: !member.isNew } 
          : member
      )
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
    setError(null);

    try {
      // Create new members
      const newMembers = validMembers.filter((member) => member.isNew);
      for (const member of newMembers) {
        await createCrewMember({
          mission_id: mission.id,
          name: member.name,
          role: member.role || undefined,
          email: member.email || undefined,
        });
      }

      // Update existing members that were modified
      const modifiedMembers = validMembers.filter((member) => !member.isNew && member.isModified);
      for (const member of modifiedMembers) {
        await updateCrewMember(member.id, {
          name: member.name,
          role: member.role || undefined,
          email: member.email || undefined,
        });
      }

      setSuccessMessage('Crew updated successfully!');
      setTimeout(() => {
        navigate(`/mission/${mission.id}/scheduler`);
      }, 1500);
    } catch (err) {
      console.error('Error managing crew members:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save crew members';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveOnly = async () => {
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
    setError(null);

    try {
      // Create new members
      const newMembers = validMembers.filter((member) => member.isNew);
      for (const member of newMembers) {
        await createCrewMember({
          mission_id: mission.id,
          name: member.name,
          role: member.role || undefined,
          email: member.email || undefined,
        });
      }

      // Update existing members that were modified
      const modifiedMembers = validMembers.filter((member) => !member.isNew && member.isModified);
      for (const member of modifiedMembers) {
        await updateCrewMember(member.id, {
          name: member.name,
          role: member.role || undefined,
          email: member.email || undefined,
        });
      }

      setSuccessMessage('Crew saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error managing crew members:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save crew members';
      setError(errorMessage);
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

  const hasExistingCrew = crew.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="container mx-auto px-6 max-w-4xl">
        <Link
          to={hasExistingCrew ? `/mission/${mission.id}/scheduler` : '/'}
          className="inline-flex items-center text-space-600 dark:text-space-400 hover:underline mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {hasExistingCrew ? 'Back to Mission' : 'Back to Mission Control'}
        </Link>

        <Card className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {hasExistingCrew ? 'Manage Crew' : 'Crew Selection'}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {hasExistingCrew ? 'Edit crew members for: ' : 'Add crew members for: '}
              <span className="font-semibold">{mission.name}</span>
            </p>
          </div>

          {successMessage && (
            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-green-800 dark:text-green-200 text-sm">{successMessage}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

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
                        Name {member.isNew && <span className="text-green-600">(New)</span>}
                      </label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => updateCrewMemberField(member.id, 'name', e.target.value)}
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
                          onChange={(e) => updateCrewMemberField(member.id, 'role', e.target.value)}
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
                          onChange={(e) => updateCrewMemberField(member.id, 'email', e.target.value)}
                          placeholder="email@example.com"
                          className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-space-500"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>

                  {(crewMembers.length > 1 || !member.isNew) && (
                    <div className="flex items-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCrewMember(member.id, member.isNew)}
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
                onClick={() => navigate(hasExistingCrew ? `/mission/${mission.id}/scheduler` : '/')}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              
              {hasExistingCrew && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveOnly}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              )}
              
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4 mr-2" />
                    {hasExistingCrew ? 'Save & Go to Scheduler' : 'Continue to Scheduler'}
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
