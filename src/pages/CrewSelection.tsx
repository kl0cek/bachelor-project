import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { ArrowLeft, Users, UserPlus, Trash2, Rocket, ArrowRight } from 'lucide-react';
import { Card, Button } from '../components/ui/index';

interface CrewMemberForm {
  id: string;
  name: string;
  role: string;
}

export const CrewSelection = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [crewMembers, setCrewMembers] = useState<CrewMemberForm[]>([
    { id: 'crew-1', name: '', role: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addCrewMember = () => {
    const newId = `crew-${Date.now()}`;
    setCrewMembers([...crewMembers, { id: newId, name: '', role: '' }]);
  };

  const removeCrewMember = (id: string) => {
    if (crewMembers.length > 1) {
      setCrewMembers(crewMembers.filter(member => member.id !== id));
    }
  };

  const updateCrewMember = (id: string, field: 'name' | 'role', value: string) => {
    setCrewMembers(crewMembers.map(member => 
      member.id === id ? { ...member, [field]: value } : member
    ));
  };

  const isFormValid = crewMembers.length > 0 && 
    crewMembers.every(member => member.name.trim() && member.role.trim());

  const handleSubmit = () => {
    if (!isFormValid) return;

    setIsSubmitting(true);

    console.log('Crew members:', crewMembers);

    setTimeout(() => {
      navigate(`/mission/${id}/scheduler`);
    }, 1000);
  };

  const roles = [
    'Commander',
    'Pilot',
    'Flight Engineer',
    'Mission Specialist',
    'Science Officer',
    'Medical Officer',
    'Payload Specialist'
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-6 py-8 max-w-5xl">
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
              <Users className="h-8 w-8 text-space-600 dark:text-space-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Select Mission Crew
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Add crew members who will participate in this mission
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3">
            <Rocket className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Mission ID: {id}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                      Crew Members
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {crewMembers.length} {crewMembers.length === 1 ? 'member' : 'members'} added
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addCrewMember}
                    className="flex items-center gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Add Member
                  </Button>
                </div>

                <div className="space-y-4">
                  {crewMembers.map((member, index) => (
                    <div
                      key={member.id}
                      className="p-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-4"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                          Crew Member #{index + 1}
                        </span>
                        {crewMembers.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCrewMember(member.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            Name *
                          </label>
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => updateCrewMember(member.id, 'name', e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-space-500 focus:border-transparent"
                            placeholder="Enter astronaut name"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            Role *
                          </label>
                          <select
                            value={member.role}
                            onChange={(e) => updateCrewMember(member.id, 'role', e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-space-500 focus:border-transparent"
                          >
                            <option value="">Select a role</option>
                            {roles.map(role => (
                              <option key={role} value={role}>{role}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <Link to="/">
                    <Button type="button" variant="ghost">
                      Cancel
                    </Button>
                  </Link>
                  <Button 
                    onClick={handleSubmit}
                    disabled={!isFormValid || isSubmitting}
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                        Setting up crew...
                      </>
                    ) : (
                      <>
                        Continue to Scheduler
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Setup Progress
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                      ✓
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      Mission Created
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      Basic information configured
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
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      Crew Selection
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      Add mission crew members
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      3
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      Schedule Activities
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      Create crew schedules
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Crew Roles
              </h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <p className="font-medium text-slate-900 dark:text-slate-100">Commander</p>
                  <p className="text-slate-600 dark:text-slate-400">
                    Mission leader and decision maker
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <p className="font-medium text-slate-900 dark:text-slate-100">Flight Engineer</p>
                  <p className="text-slate-600 dark:text-slate-400">
                    Systems and technical operations
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <p className="font-medium text-slate-900 dark:text-slate-100">Science Officer</p>
                  <p className="text-slate-600 dark:text-slate-400">
                    Research and experiments
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Crew Size Recommendations
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Typical missions include 3-6 crew members for optimal task distribution and team dynamics. Ensure diverse skill sets across the crew.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};