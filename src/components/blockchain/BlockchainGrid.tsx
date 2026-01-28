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
          <div className="w-4 h-4 rounded bg-gradient-to-br from-muted/50 to-muted" />
          <span>0-20%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-primary/40 to-primary/60" />
          <span>40-60%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-primary/80 to-primary" />
          <span>80-100%</span>
        </div>
      </div>
    </div>
  );
}
