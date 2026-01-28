import { useState } from 'react';
import { useSeoMeta } from '@unhead/react';
import { useMultiBlockchain } from '@/hooks/useMultiBlockchain';
import { SetupWizard } from '@/components/blockchain/SetupWizard';
import { BlockchainGrid } from '@/components/blockchain/BlockchainGrid';
import { BlockDetailDialog } from '@/components/blockchain/BlockDetailDialog';
import { CriteriaManager } from '@/components/blockchain/CriteriaManager';
import { BlockchainAnalytics } from '@/components/blockchain/BlockchainAnalytics';
import { ChainManager } from '@/components/blockchain/ChainManager';
import { ChainSelector } from '@/components/blockchain/ChainSelector';
import { Block, Criteria } from '@/types/blockchain';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Grid3x3, Settings, Database } from 'lucide-react';
import { format } from 'date-fns';

const Index = () => {
  const {
    chains,
    activeChain,
    createChain,
    switchChain,
    renameChain,
    deleteChain,
    state,
    activeCriteria,
    addCriteria,
    updateCriteria,
    archiveCriteria,
    toggleCompletion,
  } = useMultiBlockchain();

  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [showSetupWizard, setShowSetupWizard] = useState(false);

  useSeoMeta({
    title: 'Personal Blockchain - Track Your Daily Goals',
    description: 'Visualize your daily progress as an immutable blockchain. Mine blocks by completing goals.',
  });

  const handleBlockClick = (block: Block) => {
    setSelectedBlock(block);
    setDetailDialogOpen(true);
  };

  const handleToggleCompletion = (criteriaId: string) => {
    toggleCompletion(criteriaId);
  };

  const handleCreateChain = (name: string, description: string, startDate: string, criteria: Criteria[]) => {
    createChain(name, description, startDate, criteria);
    setShowSetupWizard(false);
  };

  const handleNewChain = () => {
    setShowSetupWizard(true);
  };

  // Show setup wizard if creating new chain or no chains exist
  if (showSetupWizard || chains.length === 0) {
    return <SetupWizard onComplete={handleCreateChain} />;
  }

  const currentBlock = state.currentBlock;
  const todayDate = currentBlock ? format(new Date(currentBlock.date), 'EEEE, MMMM d, yyyy') : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <div className="h-5 w-5 rounded bg-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">Personal Blockchain</h1>
                  <ChainSelector
                    chains={chains}
                    activeChainId={activeChain?.id || null}
                    onSwitch={switchChain}
                  />
                </div>
                <p className="text-sm text-muted-foreground">{todayDate}</p>
              </div>
            </div>
            {currentBlock && (
              <Button
                onClick={() => handleBlockClick(currentBlock)}
                size="lg"
                className="shadow-lg"
              >
                Today's Block #{currentBlock.blockNumber}
                <span className="ml-2 px-2 py-0.5 rounded-full bg-primary-foreground/20 text-sm font-bold">
                  {currentBlock.fillPercentage}%
                </span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="chain" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4">
            <TabsTrigger value="chain">
              <Grid3x3 className="mr-2 h-4 w-4" />
              Chain
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="chains">
              <Database className="mr-2 h-4 w-4" />
              Chains
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chain" className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Your Blockchain</h2>
              <p className="text-muted-foreground">
                Each block represents one day. Click any block to view details.
              </p>
            </div>
            <BlockchainGrid
              blocks={state.blocks}
              onBlockClick={handleBlockClick}
              className="max-w-6xl mx-auto"
            />
          </TabsContent>

          <TabsContent value="analytics">
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Analytics</h2>
                <p className="text-muted-foreground">
                  Track your progress and identify patterns over time
                </p>
              </div>
              <BlockchainAnalytics blocks={state.blocks} />
            </div>
          </TabsContent>

          <TabsContent value="chains">
            <div className="max-w-4xl mx-auto">
              <ChainManager
                chains={chains}
                activeChainId={activeChain?.id || null}
                onSwitch={switchChain}
                onRename={renameChain}
                onDelete={deleteChain}
                onCreateNew={handleNewChain}
              />
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Chain Settings</h2>
                <p className="text-muted-foreground">
                  Manage criteria for {activeChain?.name}
                </p>
              </div>
              <CriteriaManager
                criteria={state.config.criteria}
                onAdd={addCriteria}
                onUpdate={updateCriteria}
                onArchive={archiveCriteria}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Block detail dialog */}
      <BlockDetailDialog
        block={selectedBlock}
        criteria={state.config.criteria}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onToggleCompletion={handleToggleCompletion}
      />

      {/* Footer */}
      <footer className="border-t mt-16 py-8 text-center text-sm text-muted-foreground">
        <p>
          Vibed with{' '}
          <a
            href="https://shakespeare.diy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Shakespeare
          </a>
        </p>
      </footer>
    </div>
  );
};

export default Index;
