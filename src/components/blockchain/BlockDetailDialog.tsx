import { Block, Criteria, CriteriaCompletion } from '@/types/blockchain';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { CheckCircle2, XCircle, Lock, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface BlockDetailDialogProps {
  block: Block | null;
  criteria: Criteria[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleCompletion?: (criteriaId: string) => void;
}

export function BlockDetailDialog({
  block,
  criteria,
  open,
  onOpenChange,
  onToggleCompletion,
}: BlockDetailDialogProps) {
  if (!block) return null;

  const date = new Date(block.date);
  const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const canEdit = !block.mined && isToday && onToggleCompletion;
  const paddedBlockNumber = String(block.blockNumber).padStart(6, '0');

  const getCriteriaStatus = (completion: CriteriaCompletion) => {
    const criteriaItem = criteria.find((c) => c.id === completion.criteriaId);
    if (!criteriaItem) return null;

    const isSuccess =
      criteriaItem.type === 'goal' ? completion.completed : !completion.completed;

    return {
      criteria: criteriaItem,
      isSuccess,
      completion,
    };
  };

  const completionStatuses = block.completions
    .map(getCriteriaStatus)
    .filter((s) => s !== null && !s.criteria.archived);

  const successCount = completionStatuses.filter((s) => s?.isSuccess).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-mono">Block #{paddedBlockNumber}</span>
              {block.mined ? (
                <Lock className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Unlock className="h-5 w-5 text-primary" />
              )}
            </div>
          </DialogTitle>
          <DialogDescription>
            {format(date, 'EEEE, MMMM d, yyyy')}
            {isToday && ' (Today)'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Block stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted">
              <div className="text-2xl font-bold text-foreground">{block.fillPercentage}%</div>
              <div className="text-xs text-muted-foreground">Filled</div>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <div className="text-2xl font-bold text-foreground">
                {successCount}/{completionStatuses.length}
              </div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <div className="text-sm font-mono text-foreground truncate">{block.hash}</div>
              <div className="text-xs text-muted-foreground">Hash</div>
            </div>
          </div>

          {/* Completion list */}
          <div>
            <h3 className="font-semibold mb-4">
              Criteria Status
              {canEdit && <span className="text-sm text-muted-foreground ml-2">(Click to toggle)</span>}
            </h3>
            <div className="space-y-2">
              {completionStatuses.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No criteria defined for this block
                </div>
              )}
              {completionStatuses.map((status) => {
                if (!status) return null;

                const { criteria: criteriaItem, isSuccess, completion } = status;

                return (
                  <div
                    key={completion.criteriaId}
                    className={cn(
                      'flex items-start gap-3 p-4 rounded-lg border transition-colors',
                      isSuccess && 'bg-primary/5 border-primary/20',
                      !isSuccess && 'bg-muted/50',
                      canEdit && 'hover:bg-accent/50 cursor-pointer'
                    )}
                    onClick={() => {
                      if (canEdit) {
                        onToggleCompletion(completion.criteriaId);
                      }
                    }}
                  >
                    {canEdit ? (
                      <Checkbox
                        checked={completion.completed}
                        className="mt-0.5"
                        onCheckedChange={() => onToggleCompletion(completion.criteriaId)}
                      />
                    ) : isSuccess ? (
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Label className="font-medium cursor-pointer">{criteriaItem.name}</Label>
                        <span
                          className={cn(
                            'text-xs px-2 py-0.5 rounded-full',
                            criteriaItem.type === 'goal'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-destructive/10 text-destructive'
                          )}
                        >
                          {criteriaItem.type}
                        </span>
                      </div>
                      {criteriaItem.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {criteriaItem.description}
                        </p>
                      )}
                      {completion.completedAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {criteriaItem.type === 'goal' ? 'Completed' : 'Marked'} at{' '}
                          {format(new Date(completion.completedAt), 'h:mm a')}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status message */}
          {block.mined && (
            <div className="p-4 rounded-lg bg-muted border border-border">
              <div className="flex items-center gap-2 text-sm">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  This block has been mined and can no longer be modified.
                </span>
              </div>
            </div>
          )}

          {!block.mined && !isToday && (
            <div className="p-4 rounded-lg bg-muted border border-border">
              <div className="flex items-center gap-2 text-sm">
                <Unlock className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">
                  This block will be mined at midnight tonight.
                </span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
