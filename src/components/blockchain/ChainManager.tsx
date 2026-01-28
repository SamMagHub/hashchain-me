import { useState } from 'react';
import { Blockchain } from '@/types/blockchain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Plus, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface ChainManagerProps {
  chains: Blockchain[];
  activeChainId: string | null;
  onSwitch: (chainId: string) => void;
  onRename: (chainId: string, name: string, description: string) => void;
  onDelete: (chainId: string) => void;
  onCreateNew: () => void;
}

export function ChainManager({
  chains,
  activeChainId,
  onSwitch,
  onRename,
  onDelete,
  onCreateNew,
}: ChainManagerProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedChain, setSelectedChain] = useState<Blockchain | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleOpenEdit = (chain: Blockchain) => {
    setSelectedChain(chain);
    setFormData({
      name: chain.name,
      description: chain.description || '',
    });
    setEditDialogOpen(true);
  };

  const handleOpenDelete = (chain: Blockchain) => {
    setSelectedChain(chain);
    setDeleteDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedChain || !formData.name.trim()) return;
    onRename(selectedChain.id, formData.name, formData.description);
    setEditDialogOpen(false);
    setSelectedChain(null);
  };

  const handleDelete = () => {
    if (!selectedChain) return;
    onDelete(selectedChain.id);
    setDeleteDialogOpen(false);
    setSelectedChain(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Manage Blockchains</CardTitle>
            <CardDescription>Create and switch between different goal chains</CardDescription>
          </div>
          <Button onClick={onCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            New Chain
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {chains.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No blockchains yet. Create your first chain to get started.
          </div>
        ) : (
          <div className="space-y-2">
            {chains.map((chain) => {
              const isActive = chain.id === activeChainId;
              const blockCount = chain.state.blocks.length;
              const avgFill =
                chain.state.blocks.filter((b) => b.mined).length > 0
                  ? Math.round(
                      chain.state.blocks
                        .filter((b) => b.mined)
                        .reduce((sum, b) => sum + b.fillPercentage, 0) /
                        chain.state.blocks.filter((b) => b.mined).length
                    )
                  : 0;

              return (
                <div
                  key={chain.id}
                  className={cn(
                    'flex items-start justify-between p-4 rounded-lg border transition-colors',
                    isActive
                      ? 'bg-primary/5 border-primary/30 ring-2 ring-primary/20'
                      : 'bg-card hover:bg-accent/5'
                  )}
                >
                  <button
                    onClick={() => onSwitch(chain.id)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-lg">{chain.name}</span>
                      {isActive && (
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          <CheckCircle2 className="h-3 w-3" />
                          Active
                        </span>
                      )}
                    </div>
                    {chain.description && (
                      <p className="text-sm text-muted-foreground mt-1">{chain.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{blockCount} blocks</span>
                      <span>{avgFill}% avg fill</span>
                      <span>
                        Started {format(new Date(chain.state.config.startDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </button>
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(chain)}
                      className="hover:bg-primary/10 hover:text-primary"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDelete(chain)}
                      className="hover:bg-destructive/10 hover:text-destructive"
                      disabled={chains.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Blockchain</DialogTitle>
            <DialogDescription>Update the name and description of this chain</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Chain Name</Label>
              <Input
                id="edit-name"
                placeholder="e.g., Fitness Goals"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && formData.name.trim()) {
                    e.preventDefault();
                    handleUpdate();
                  }
                }}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Textarea
                id="edit-description"
                placeholder="What is this blockchain for?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <Button onClick={handleUpdate} disabled={!formData.name.trim()} className="w-full">
              Update Chain
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blockchain?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedChain?.name}"? This will permanently remove
              all blocks and data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
