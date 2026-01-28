import { cn } from '@/lib/utils';
import { Block } from '@/types/blockchain';
import { format } from 'date-fns';
import { Lock, Unlock } from 'lucide-react';

interface BlockCardProps {
  block: Block;
  onClick?: () => void;
  compact?: boolean;
}

export function BlockCard({ block, onClick, compact = false }: BlockCardProps) {
  const date = new Date(block.date);
  const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={cn(
          'relative overflow-hidden rounded border border-border/50 transition-all duration-300',
          'hover:scale-105 hover:shadow-lg hover:border-primary/50',
          'bg-muted/30',
          isToday && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
        )}
        style={{
          width: '100%',
          aspectRatio: '1/1',
        }}
      >
        {/* Filled portion (from bottom) */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary via-primary to-primary/90 transition-all duration-700 ease-out"
          style={{ height: `${block.fillPercentage}%` }}
        >
          {/* Inner glow effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
        </div>

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-1 z-10">
          <div className={cn(
            "text-[10px] font-bold leading-tight text-center transition-colors",
            block.fillPercentage > 30 ? 'text-white' : 'text-foreground'
          )}>
            #{block.blockNumber}
          </div>
          <div className={cn(
            "text-[8px] leading-tight transition-colors",
            block.fillPercentage > 30 ? 'text-white/80' : 'text-muted-foreground'
          )}>
            {block.fillPercentage}%
          </div>
        </div>

        {/* Lock icon */}
        {block.mined && (
          <Lock className={cn(
            "absolute bottom-1 right-1 h-2 w-2 z-10 transition-colors",
            block.fillPercentage > 30 ? 'text-white/60' : 'text-muted-foreground/60'
          )} />
        )}

        {/* Subtle grid pattern overlay for texture */}
        <div 
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent)`,
            backgroundSize: '8px 8px',
          }}
        />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-lg border border-border transition-all duration-300',
        'hover:scale-102 hover:shadow-xl hover:border-primary/50',
        'bg-muted/50',
        isToday && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
      )}
    >
      {/* Filled portion (from bottom) */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary via-primary to-primary/90 transition-all duration-700 ease-out"
        style={{ height: `${block.fillPercentage}%` }}
      >
        {/* Inner glow effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-sm font-mono font-bold transition-colors",
                block.fillPercentage > 40 ? 'text-white' : 'text-foreground'
              )}>
                Block #{block.blockNumber}
              </span>
              {block.mined ? (
                <Lock className={cn(
                  "h-3 w-3 transition-colors",
                  block.fillPercentage > 40 ? 'text-white/60' : 'text-muted-foreground'
                )} />
              ) : (
                <Unlock className={cn(
                  "h-3 w-3 transition-colors",
                  block.fillPercentage > 40 ? 'text-white/80' : 'text-primary'
                )} />
              )}
            </div>
            <div className={cn(
              "text-xs font-medium transition-colors",
              block.fillPercentage > 40 ? 'text-white/70' : 'text-muted-foreground'
            )}>
              {format(date, 'MMM d, yyyy')}
            </div>
          </div>
          <div className="text-right">
            <div className={cn(
              "text-2xl font-bold transition-colors",
              block.fillPercentage > 40 ? 'text-white' : 'text-foreground'
            )}>
              {block.fillPercentage}%
            </div>
            <div className={cn(
              "text-xs transition-colors",
              block.fillPercentage > 40 ? 'text-white/70' : 'text-muted-foreground'
            )}>
              filled
            </div>
          </div>
        </div>

        {/* Block hash */}
        <div className={cn(
          "pt-2 border-t transition-colors",
          block.fillPercentage > 40 ? 'border-white/10' : 'border-border'
        )}>
          <div className={cn(
            "text-[10px] font-mono truncate transition-colors",
            block.fillPercentage > 40 ? 'text-white/50' : 'text-muted-foreground'
          )}>
            {block.hash}
          </div>
        </div>

        {/* Fill indicator bar */}
        <div className={cn(
          "w-full h-2 rounded-full overflow-hidden transition-colors",
          block.fillPercentage > 40 ? 'bg-white/10' : 'bg-muted'
        )}>
          <div
            className={cn(
              "h-full transition-all duration-500",
              block.fillPercentage > 40 ? 'bg-white/40' : 'bg-primary'
            )}
            style={{ width: `${block.fillPercentage}%` }}
          />
        </div>

        {isToday && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-primary text-primary-foreground text-xs font-bold rounded shadow-lg z-20">
            TODAY
          </div>
        )}
      </div>

      {/* Subtle grid pattern overlay for texture */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent)`,
          backgroundSize: '12px 12px',
        }}
      />
    </button>
  );
}
