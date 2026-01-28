import { useMemo, useState } from 'react';
import { Block } from '@/types/blockchain';
import { BlockCard } from './BlockCard';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface BlockchainGridProps {
  blocks: Block[];
  onBlockClick: (block: Block) => void;
  className?: string;
}

const BLOCKS_PER_PAGE = 35;

export function BlockchainGrid({ blocks, onBlockClick, className }: BlockchainGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  // Filter blocks based on search query
  const filteredBlocks = useMemo(() => {
    if (!searchQuery.trim()) return blocks;

    const query = searchQuery.toLowerCase();
    return blocks.filter((block) => {
      // Search by block number (with or without padding)
      const blockNum = String(block.blockNumber).padStart(6, '0');
      if (blockNum.includes(query)) return true;

      // Search by date in various formats
      const date = new Date(block.date);
      const formats = [
        format(date, 'yyyy-MM-dd'),
        format(date, 'MM/dd/yyyy'),
        format(date, 'MMM d, yyyy'),
        format(date, 'MMMM d, yyyy'),
      ];
      
      return formats.some(f => f.toLowerCase().includes(query));
    });
  }, [blocks, searchQuery]);

  const totalPages = Math.ceil(filteredBlocks.length / BLOCKS_PER_PAGE);
  
  // Reset to last page when search changes
  useMemo(() => {
    if (searchQuery.trim()) {
      setCurrentPage(0);
    } else {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [searchQuery, totalPages]);

  // Separate mined and unmined blocks
  const { minedBlocks, unminedBlocks } = useMemo(() => {
    const mined = filteredBlocks.filter(b => b.mined);
    const unmined = filteredBlocks.filter(b => !b.mined);
    return { minedBlocks: mined, unminedBlocks: unmined };
  }, [filteredBlocks]);

  const paginatedBlocks = useMemo(() => {
    const start = currentPage * BLOCKS_PER_PAGE;
    const end = start + BLOCKS_PER_PAGE;
    return filteredBlocks.slice(start, end);
  }, [filteredBlocks, currentPage]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const startBlock = currentPage * BLOCKS_PER_PAGE;
  const endBlock = Math.min(startBlock + BLOCKS_PER_PAGE, filteredBlocks.length);

  if (blocks.length === 0) {
    return (
      <div className={cn('flex items-center justify-center p-12', className)}>
        <p className="text-muted-foreground">No blocks yet</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Search bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by block number or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery('')}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {searchQuery ? (
            <>Found {filteredBlocks.length} blocks ({minedBlocks.length} mined, {unminedBlocks.length} unmined)</>
          ) : (
            <>Total: {blocks.length} blocks ({minedBlocks.length} mined, {unminedBlocks.length} unmined)</>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          Showing all pending blocks and last 20 mined blocks
        </div>
      </div>

      {/* Horizontal block layout with vertical divider */}
      <div className="relative">
        {/* Mempool.space style horizontal layout */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {/* Unmined blocks section (left side) */}
          <div className="flex-shrink-0">
            <div className="flex flex-col items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-muted-foreground">
                Pending Blocks
              </span>
              <span className="text-xs text-muted-foreground">
                ({unminedBlocks.length} unmined)
              </span>
            </div>
            <div className="flex gap-3">
              {unminedBlocks.slice().reverse().map((block) => (
                <div key={block.blockNumber} className="flex-shrink-0 w-24">
                  <BlockCard block={block} onClick={() => onBlockClick(block)} compact />
                </div>
              ))}
            </div>
          </div>

          {/* Vertical divider */}
          <div className="relative flex-shrink-0 px-6">
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 border-l-2 border-dashed border-primary/30" />
          </div>

          {/* Mined blocks section (right side) */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-muted-foreground">
                Mined Blocks
              </span>
              <span className="text-xs text-muted-foreground">
                ({minedBlocks.length} mined)
              </span>
            </div>
            <div className="flex gap-3 flex-wrap">
              {minedBlocks.slice(-20).map((block) => (
                <div key={block.blockNumber} className="flex-shrink-0 w-24">
                  <BlockCard block={block} onClick={() => onBlockClick(block)} compact />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-8 text-xs text-muted-foreground pt-4 border-t">
        <div className="flex items-center gap-2">
          <div className="relative w-6 h-6 rounded border border-border/50 bg-muted/30 overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary to-primary/90" style={{ height: '25%' }} />
          </div>
          <span>25% Full</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-6 h-6 rounded border border-border/50 bg-muted/30 overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary to-primary/90" style={{ height: '50%' }} />
          </div>
          <span>50% Full</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-6 h-6 rounded border border-border/50 bg-muted/30 overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary to-primary/90" style={{ height: '100%' }} />
          </div>
          <span>100% Full</span>
        </div>
        <div className="h-4 w-px bg-border mx-2" />
        <div className="flex items-center gap-2">
          <div className="w-0.5 h-6 border-l-2 border-dashed border-primary/30" />
          <span>Mining Boundary</span>
        </div>
      </div>
    </div>
  );
}
