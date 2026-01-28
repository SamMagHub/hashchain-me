import { useState } from 'react';
import { Criteria } from '@/types/blockchain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { Plus, Pencil, Archive } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CriteriaManagerProps {
  criteria: Criteria[];
  onAdd: (criteria: Criteria) => void;
  onUpdate: (criteriaId: string, updates: Partial<Criteria>) => void;
  onArchive: (criteriaId: string) => void;
}

export function CriteriaManager({ criteria, onAdd, onUpdate, onArchive }: CriteriaManagerProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [selectedCriteria, setSelectedCriteria] = useState<Criteria | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'goal' as 'goal' | 'prohibition',
  });

  const activeCriteria = criteria.filter((c) => !c.archived);

  const handleOpenAdd = () => {
    setFormData({ name: '', description: '', type: 'goal' });
    setAddDialogOpen(true);
  };

  const handleOpenEdit = (criteria: Criteria) => {
    setSelectedCriteria(criteria);
    setFormData({
      name: criteria.name,
      description: criteria.description,
      type: criteria.type,
    });
    setEditDialogOpen(true);
  };

  const handleOpenArchive = (criteria: Criteria) => {
    setSelectedCriteria(criteria);
    setArchiveDialogOpen(true);
  };

  const handleAdd = () => {
    if (!formData.name.trim()) return;

    const criteria: Criteria = {
      id: `criteria-${Date.now()}-${Math.random()}`,
      name: formData.name,
      description: formData.description,
      type: formData.type,
      createdAt: Date.now(),
    };

    onAdd(criteria);
    setAddDialogOpen(false);
    setFormData({ name: '', description: '', type: 'goal' });
  };

  const handleUpdate = () => {
    if (!selectedCriteria || !formData.name.trim()) return;

    onUpdate(selectedCriteria.id, {
      name: formData.name,
      description: formData.description,
      type: formData.type,
    });

    setEditDialogOpen(false);
    setSelectedCriteria(null);
  };

  const handleArchive = () => {
    if (!selectedCriteria) return;
    onArchive(selectedCriteria.id);
    setArchiveDialogOpen(false);
    setSelectedCriteria(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Manage Criteria</CardTitle>
            <CardDescription>
              Add, edit, or archive your daily goals and prohibitions
            </CardDescription>
          </div>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenAdd}>
                <Plus className="mr-2 h-4 w-4" />
                Add Criteria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Criteria</DialogTitle>
                <DialogDescription>
                  Create a new goal or prohibition to track daily
                </DialogDescription>
              </DialogHeader>
              <CriteriaForm
                formData={formData}
                onChange={setFormData}
                onSubmit={handleAdd}
                submitLabel="Add Criteria"
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {activeCriteria.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No criteria yet. Add your first goal or prohibition to get started.
          </div>
        ) : (
          <div className="space-y-2">
            {activeCriteria.map((c) => (
              <div
                key={c.id}
                className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
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
                    <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(c)}
                    className="hover:bg-primary/10 hover:text-primary"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenArchive(c)}
                    className="hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Criteria</DialogTitle>
            <DialogDescription>Update the details of this criteria</DialogDescription>
          </DialogHeader>
          <CriteriaForm
            formData={formData}
            onChange={setFormData}
            onSubmit={handleUpdate}
            submitLabel="Update Criteria"
          />
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Criteria?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove "{selectedCriteria?.name}" from future blocks. Past blocks will not
              be affected. This action can be undone by editing your data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>Archive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

interface CriteriaFormProps {
  formData: {
    name: string;
    description: string;
    type: 'goal' | 'prohibition';
  };
  onChange: (data: { name: string; description: string; type: 'goal' | 'prohibition' }) => void;
  onSubmit: () => void;
  submitLabel: string;
}

function CriteriaForm({ formData, onChange, onSubmit, submitLabel }: CriteriaFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Criteria Name</Label>
        <Input
          id="name"
          placeholder="e.g., Exercise for 30 minutes"
          value={formData.name}
          onChange={(e) => onChange({ ...formData, name: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && formData.name.trim()) {
              e.preventDefault();
              onSubmit();
            }
          }}
        />
      </div>
      <div>
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          placeholder="Add more details..."
          value={formData.description}
          onChange={(e) => onChange({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>
      <div>
        <Label>Type</Label>
        <RadioGroup
          value={formData.type}
          onValueChange={(value: 'goal' | 'prohibition') =>
            onChange({ ...formData, type: value })
          }
          className="flex gap-4 mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="goal" id="form-goal" />
            <Label htmlFor="form-goal" className="font-normal cursor-pointer">
              Goal (should do)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="prohibition" id="form-prohibition" />
            <Label htmlFor="form-prohibition" className="font-normal cursor-pointer">
              Prohibition (should NOT do)
            </Label>
          </div>
        </RadioGroup>
      </div>
      <Button onClick={onSubmit} disabled={!formData.name.trim()} className="w-full">
        {submitLabel}
      </Button>
    </div>
  );
}
