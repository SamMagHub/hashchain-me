import { cn } from '@/lib/utils';
import { Block } from '@/types/blockchain';
import { format } from 'date-fns';
import { Lock, Unlock } from 'lucide-react';

interface BlockCardProps {
  block: Block;
  onClick?: () => void;
  compact?: boolean;
}

function getBlockColor(fillPercentage: number): string {
  if (fillPercentage >= 80) return 'from-primary/80 to-primary';
  if (fillPercentage >= 60) return 'from-primary/60 to-primary/80';
  if (fillPercentage >= 40) return 'from-primary/40 to-primary/60';
  if (fillPercentage >= 20) return 'from-primary/20 to-primary/40';
  return 'from-muted/50 to-muted';
}

export function BlockCard({ block, onClick, compact = false }: BlockCardProps) {
  const gradientClass = getBlockColor(block.fillPercentage);
  const date = new Date(block.date);
  const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={cn(
          'relative group rounded border transition-all duration-300',
          'hover:scale-105 hover:shadow-lg hover:border-primary/50',
          'bg-gradient-to-br',
          gradientClass,
          isToday && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
        )}
        style={{
          width: '100%',
          aspectRatio: '1/1',
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
          <div className="text-[10px] font-bold text-white/90 leading-tight text-center">
            #{block.blockNumber}
          </div>
          <div className="text-[8px] text-white/70 leading-tight">
            {block.fillPercentage}%
          </div>
        </div>
        {block.mined && (
          <Lock className="absolute bottom-1 right-1 h-2 w-2 text-white/60" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative group rounded-lg border transition-all duration-300 overflow-hidden',
        'hover:scale-102 hover:shadow-xl hover:border-primary/50',
        'bg-gradient-to-br',
        gradientClass,
        isToday && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
      )}
    >
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-bold text-white/90">
                Block #{block.blockNumber}
              </span>
              {block.mined ? (
                <Lock className="h-3 w-3 text-white/60" />
              ) : (
                <Unlock className="h-3 w-3 text-white/80" />
              )}
            </div>
            <div className="text-xs text-white/70 font-medium">
              {format(date, 'MMM d, yyyy')}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {block.fillPercentage}%
            </div>
            <div className="text-xs text-white/70">filled</div>
          </div>
        </div>

        {/* Block hash */}
        <div className="pt-2 border-t border-white/10">
          <div className="text-[10px] font-mono text-white/50 truncate">
            {block.hash}
          </div>
        </div>

        {/* Fill indicator */}
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-white/40 transition-all duration-500"
            style={{ width: `${block.fillPercentage}%` }}
          />
        </div>

        {isToday && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-primary text-primary-foreground text-xs font-bold rounded">
            TODAY
          </div>
        )}
      </div>
    </button>
  );
}
