import { useMemo } from 'react';
import { Block } from '@/types/blockchain';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format } from 'date-fns';

interface BlockchainAnalyticsProps {
  blocks: Block[];
}

export function BlockchainAnalytics({ blocks }: BlockchainAnalyticsProps) {
  const stats = useMemo(() => {
    if (blocks.length === 0) {
      return {
        avgFillPercentage: 0,
        totalBlocks: 0,
        minedBlocks: 0,
        perfectBlocks: 0,
        chartData: [],
        last30Days: [],
      };
    }

    const minedBlocks = blocks.filter((b) => b.mined);
    const avgFillPercentage = minedBlocks.length > 0
      ? Math.round(
          minedBlocks.reduce((sum, b) => sum + b.fillPercentage, 0) / minedBlocks.length
        )
      : 0;

    const perfectBlocks = minedBlocks.filter((b) => b.fillPercentage === 100).length;

    // Chart data for area chart (all blocks)
    const chartData = blocks.map((block) => ({
      date: format(new Date(block.date), 'MMM d'),
      fill: block.fillPercentage,
      blockNumber: block.blockNumber,
    }));

    // Last 30 days for bar chart
    const last30Days = blocks.slice(-30).map((block) => ({
      date: format(new Date(block.date), 'MMM d'),
      fill: block.fillPercentage,
      blockNumber: block.blockNumber,
    }));

    return {
      avgFillPercentage,
      totalBlocks: blocks.length,
      minedBlocks: minedBlocks.length,
      perfectBlocks,
      chartData,
      last30Days,
    };
  }, [blocks]);

  if (blocks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>No data yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            Start tracking your progress to see analytics
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Blocks</CardDescription>
            <CardTitle className="text-3xl">{stats.totalBlocks}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Mined Blocks</CardDescription>
            <CardTitle className="text-3xl">{stats.minedBlocks}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Fill</CardDescription>
            <CardTitle className="text-3xl">{stats.avgFillPercentage}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Perfect Blocks</CardDescription>
            <CardTitle className="text-3xl">{stats.perfectBlocks}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Area chart - all time trend */}
      <Card>
        <CardHeader>
          <CardTitle>All-Time Progress</CardTitle>
          <CardDescription>Block fill percentage over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stats.chartData}>
              <defs>
                <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Block
                            </span>
                            <span className="font-bold text-muted-foreground">
                              #{payload[0].payload.blockNumber}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Fill
                            </span>
                            <span className="font-bold">{payload[0].value}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="fill"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#fillGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bar chart - last 30 days */}
      {stats.last30Days.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Last 30 Days</CardTitle>
            <CardDescription>Recent performance breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.last30Days}>
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Block
                              </span>
                              <span className="font-bold text-muted-foreground">
                                #{payload[0].payload.blockNumber}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Fill
                              </span>
                              <span className="font-bold">{payload[0].value}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="fill"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
