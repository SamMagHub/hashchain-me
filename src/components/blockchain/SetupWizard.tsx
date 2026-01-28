import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { Criteria } from '@/types/blockchain';

interface SetupWizardProps {
  onComplete: (name: string, description: string, startDate: string, criteria: Criteria[]) => void;
}

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [step, setStep] = useState(1);
  const [chainName, setChainName] = useState('');
  const [chainDescription, setChainDescription] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [newCriteria, setNewCriteria] = useState({
    name: '',
    description: '',
    type: 'goal' as 'goal' | 'prohibition',
  });

  const handleAddCriteria = () => {
    if (!newCriteria.name.trim()) return;

    const criteria: Criteria = {
      id: `criteria-${Date.now()}-${Math.random()}`,
      name: newCriteria.name,
      description: newCriteria.description,
      type: newCriteria.type,
      createdAt: Date.now(),
    };

    setCriteria((prev) => [...prev, criteria]);
    setNewCriteria({ name: '', description: '', type: 'goal' });
  };

  const handleRemoveCriteria = (id: string) => {
    setCriteria((prev) => prev.filter((c) => c.id !== id));
  };

  const handleComplete = () => {
    if (!chainName.trim() || !startDate || criteria.length === 0) return;
    const dateStr = format(startDate, 'yyyy-MM-dd');
    onComplete(chainName, chainDescription, dateStr, criteria);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-primary/20 shadow-2xl">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <div className="h-4 w-4 rounded bg-primary" />
            </div>
            <CardTitle className="text-2xl">HashChain.me</CardTitle>
          </div>
          <CardDescription>
            Create your blockchain to track daily goals and progress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Name Your Blockchain</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="chain-name">Chain Name</Label>
                    <Input
                      id="chain-name"
                      placeholder="e.g., Fitness Goals, Work Objectives, Daily Habits"
                      value={chainName}
                      onChange={(e) => setChainName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && chainName.trim()) {
                          e.preventDefault();
                          setStep(2);
                        }
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="chain-desc">Description (optional)</Label>
                    <Textarea
                      id="chain-desc"
                      placeholder="What is this blockchain for?"
                      value={chainDescription}
                      onChange={(e) => setChainDescription(e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={() => setStep(2)} disabled={!chainName.trim()} size="lg">
                  Next: Choose Start Date
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Choose Your Genesis Block Date</h3>
                <Label htmlFor="start-date" className="mb-2 block">
                  When should your blockchain begin?
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="start-date"
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !startDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-sm text-muted-foreground mt-2">
                  This will be block 0 of your chain. You can choose today or a past date.
                </p>
              </div>
              <div className="flex justify-between pt-4 gap-3">
                <Button onClick={() => setStep(1)} variant="outline" size="lg">
                  Back
                </Button>
                <Button onClick={() => setStep(3)} disabled={!startDate} size="lg">
                  Next: Add Criteria
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Define Your Criteria</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Add goals to accomplish or prohibitions to avoid each day. Your blocks will fill
                  based on completion.
                </p>

                <div className="space-y-4 mb-6">
                  <div>
                    <Label htmlFor="criteria-name">Criteria Name</Label>
                    <Input
                      id="criteria-name"
                      placeholder="e.g., Exercise for 30 minutes"
                      value={newCriteria.name}
                      onChange={(e) =>
                        setNewCriteria((prev) => ({ ...prev, name: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newCriteria.name.trim()) {
                          e.preventDefault();
                          handleAddCriteria();
                        }
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="criteria-desc">Description (optional)</Label>
                    <Textarea
                      id="criteria-desc"
                      placeholder="Add more details..."
                      value={newCriteria.description}
                      onChange={(e) =>
                        setNewCriteria((prev) => ({ ...prev, description: e.target.value }))
                      }
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <RadioGroup
                      value={newCriteria.type}
                      onValueChange={(value: 'goal' | 'prohibition') =>
                        setNewCriteria((prev) => ({ ...prev, type: value }))
                      }
                      className="flex gap-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="goal" id="goal" />
                        <Label htmlFor="goal" className="font-normal cursor-pointer">
                          Goal (should do)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="prohibition" id="prohibition" />
                        <Label htmlFor="prohibition" className="font-normal cursor-pointer">
                          Prohibition (should NOT do)
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <Button onClick={handleAddCriteria} className="w-full" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Criteria
                  </Button>
                </div>

                {criteria.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Your Criteria ({criteria.length})</Label>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {criteria.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{c.name}</span>
                              <span
                                className={cn(
                                  'text-xs px-2 py-0.5 rounded-full',
                                  c.type === 'goal'
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-destructive/10 text-destructive'
                                )}
                              >
                                {c.type}
                              </span>
                            </div>
                            {c.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {c.description}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveCriteria(c.id)}
                            className="ml-2 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4 gap-3">
                <Button onClick={() => setStep(2)} variant="outline" size="lg">
                  Back
                </Button>
                <Button onClick={handleComplete} disabled={criteria.length === 0} size="lg">
                  Start Mining Blocks
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
