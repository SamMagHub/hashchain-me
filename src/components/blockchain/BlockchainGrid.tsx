import { useMemo, useState } from 'react';
import { Block } from '@/types/blockchain';
import { BlockCard } from './BlockCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BlockchainGridProps {
  blocks: Block[];
  onBlockClick: (block: Block) => void;
  className?: string;
}

const BLOCKS_PER_PAGE = 35;

export function BlockchainGrid({ blocks, onBlockClick, className }: BlockchainGridProps) {
  const totalPages = Math.ceil(blocks.length / BLOCKS_PER_PAGE);
  const [currentPage, setCurrentPage] = useState(totalPages - 1); // Start on the last page

  const paginatedBlocks = useMemo(() => {
    const start = currentPage * BLOCKS_PER_PAGE;
    const end = start + BLOCKS_PER_PAGE;
    return blocks.slice(start, end);
  }, [blocks, currentPage]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const startBlock = currentPage * BLOCKS_PER_PAGE;
  const endBlock = Math.min(startBlock + BLOCKS_PER_PAGE, blocks.length);

  if (blocks.length === 0) {
    return (
      <div className={cn('flex items-center justify-center p-12', className)}>
        <p className="text-muted-foreground">No blocks yet</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Pagination controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Blocks {startBlock} - {endBlock - 1} of {blocks.length}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="text-sm px-3 py-1 bg-muted rounded">
            Page {currentPage + 1} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Block grid */}
      <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2">
        {paginatedBlocks.map((block) => (
          <BlockCard key={block.blockNumber} block={block} onClick={() => onBlockClick(block)} compact />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-4 border-t">
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
      </div>
    </div>
  );
}
