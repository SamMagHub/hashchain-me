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
            <>Blocks {startBlock} - {endBlock - 1} of {blocks.length} ({minedBlocks.length} mined, {unminedBlocks.length} unmined)</>
          )}
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

      {/* Block grid with divider */}
      <div className="space-y-6">
        {/* Check if current page has both mined and unmined blocks */}
        {(() => {
          const pageMinedBlocks = paginatedBlocks.filter(b => b.mined);
          const pageUnminedBlocks = paginatedBlocks.filter(b => !b.mined);
          const hasBothTypes = pageMinedBlocks.length > 0 && pageUnminedBlocks.length > 0;

          if (!hasBothTypes) {
            // No divider needed, render all blocks
            return (
              <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2">
                {paginatedBlocks.map((block) => (
                  <BlockCard key={block.blockNumber} block={block} onClick={() => onBlockClick(block)} compact />
                ))}
              </div>
            );
          }

          // Render mined blocks, divider, then unmined blocks
          return (
            <>
              {/* Mined blocks section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-border" />
                  <span className="text-xs font-medium text-muted-foreground px-2">
                    Mined Blocks ({pageMinedBlocks.length})
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-border" />
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2">
                  {pageMinedBlocks.map((block) => (
                    <BlockCard key={block.blockNumber} block={block} onClick={() => onBlockClick(block)} compact />
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-dashed border-primary/30" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-4 py-1 text-sm font-semibold text-primary rounded-full border-2 border-primary/30">
                    Mining Boundary
                  </span>
                </div>
              </div>

              {/* Unmined blocks section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-border" />
                  <span className="text-xs font-medium text-muted-foreground px-2">
                    Pending Blocks ({pageUnminedBlocks.length})
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-border" />
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2">
                  {pageUnminedBlocks.map((block) => (
                    <BlockCard key={block.blockNumber} block={block} onClick={() => onBlockClick(block)} compact />
                  ))}
                </div>
              </div>
            </>
          );
        })()}
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
