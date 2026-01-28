import { Blockchain } from '@/types/blockchain';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CheckCircle2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChainSelectorProps {
  chains: Blockchain[];
  activeChainId: string | null;
  onSwitch: (chainId: string) => void;
}

export function ChainSelector({ chains, activeChainId, onSwitch }: ChainSelectorProps) {
  const activeChain = chains.find((c) => c.id === activeChainId);

  if (chains.length === 0 || !activeChain) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <div className="h-4 w-4 rounded bg-primary/20 flex items-center justify-center">
            <div className="h-2 w-2 rounded bg-primary" />
          </div>
          <span className="font-medium">{activeChain.name}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Switch Blockchain</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {chains.map((chain) => {
          const isActive = chain.id === activeChainId;
          return (
            <DropdownMenuItem
              key={chain.id}
              onClick={() => onSwitch(chain.id)}
              className={cn(
                'cursor-pointer',
                isActive && 'bg-primary/5'
              )}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{chain.name}</div>
                  {chain.description && (
                    <div className="text-xs text-muted-foreground truncate">
                      {chain.description}
                    </div>
                  )}
                </div>
                {isActive && (
                  <CheckCircle2 className="h-4 w-4 text-primary ml-2 flex-shrink-0" />
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
