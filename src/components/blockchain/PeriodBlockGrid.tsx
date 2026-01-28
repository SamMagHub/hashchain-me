import { useMemo } from 'react';
import { Block } from '@/types/blockchain';
import { BlockCard } from './BlockCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PeriodBlockGridProps {
  blocks: Block[];
  title: string;
  description: string;
  daysToShow: number;
}

export function PeriodBlockGrid({ blocks, title, description, daysToShow }: PeriodBlockGridProps) {
  const periodBlocks = useMemo(() => {
    // Get the last N blocks (most recent)
    return blocks.slice(-daysToShow);
  }, [blocks, daysToShow]);

  const stats = useMemo(() => {
    if (periodBlocks.length === 0) {
      return {
        avgFill: 0,
        perfectDays: 0,
        totalDays: 0,
        minedDays: 0,
      };
    }

    const minedBlocks = periodBlocks.filter((b) => b.mined);
    const avgFill = minedBlocks.length > 0
      ? Math.round(minedBlocks.reduce((sum, b) => sum + b.fillPercentage, 0) / minedBlocks.length)
      : 0;
    const perfectDays = periodBlocks.filter((b) => b.fillPercentage === 100).length;

    return {
      avgFill,
      perfectDays,
      totalDays: periodBlocks.length,
      minedDays: minedBlocks.length,
    };
  }, [periodBlocks]);

  // Determine grid columns based on period
  const gridCols = daysToShow === 7 
    ? 'grid-cols-7' 
    : daysToShow === 30 
    ? 'grid-cols-6 sm:grid-cols-10' 
    : 'grid-cols-8 sm:grid-cols-12 md:grid-cols-15';

  if (periodBlocks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No data available for this period
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="text-right">
              <div className="font-bold text-lg">{stats.avgFill}%</div>
              <div className="text-muted-foreground text-xs">Avg Fill</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg">{stats.perfectDays}</div>
              <div className="text-muted-foreground text-xs">Perfect</div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`grid ${gridCols} gap-2`}>
          {periodBlocks.map((block) => (
            <BlockCard key={block.blockNumber} block={block} compact />
          ))}
        </div>
        <div className="mt-4 text-xs text-muted-foreground text-center">
          Showing {periodBlocks.length} of {daysToShow} days ({stats.minedDays} mined)
        </div>
      </CardContent>
    </Card>
  );
}
