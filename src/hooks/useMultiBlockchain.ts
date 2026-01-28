import { useCallback, useEffect, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  Block,
  Blockchain,
  BlockchainState,
  Criteria,
  CriteriaCompletion,
  MultiChainState,
  calculateFillPercentage,
  generateBlockHash,
} from '@/types/blockchain';

const STORAGE_KEY = 'multi-blockchain-state';

function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function isBlockMined(date: string): boolean {
  const blockDate = new Date(date);
  const tomorrow = new Date(blockDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return Date.now() >= tomorrow.getTime();
}

const defaultMultiChainState: MultiChainState = {
  chains: [],
  activeChainId: null,
};

export function useMultiBlockchain() {
  const [multiState, setMultiState] = useLocalStorage<MultiChainState>(
    STORAGE_KEY,
    defaultMultiChainState
  );

  // Get active blockchain
  const activeChain = useMemo(
    () => multiState.chains.find((c) => c.id === multiState.activeChainId) || null,
    [multiState.chains, multiState.activeChainId]
  );

  // Get active blockchain state
  const state = activeChain?.state || {
    config: { startDate: '', criteria: [], initialized: false },
    blocks: [],
    currentBlock: null,
  };

  // Get active (non-archived) criteria
  const activeCriteria = useMemo(
    () => state.config.criteria.filter((c) => !c.archived),
    [state.config.criteria]
  );

  // Create a new blockchain
  const createChain = useCallback(
    (name: string, description: string, startDate: string, initialCriteria: Criteria[]) => {
      const blocks: Block[] = [];
      const today = getDateString(new Date());
      const daysSinceStart = getDaysBetween(startDate, today);

      // Create blocks for each day from start to today + 7 future days
      for (let i = 0; i <= daysSinceStart + 7; i++) {
        const blockDate = new Date(startDate);
        blockDate.setDate(blockDate.getDate() + i);
        const dateStr = getDateString(blockDate);

        const completions: CriteriaCompletion[] = initialCriteria.map((c) => ({
          criteriaId: c.id,
          completed: false,
        }));

        const mined = isBlockMined(dateStr);
        const fillPercentage = mined ? 0 : 0;

        blocks.push({
          blockNumber: i,
          date: dateStr,
          timestamp: blockDate.getTime(),
          completions,
          mined,
          fillPercentage,
          hash: generateBlockHash(i, dateStr),
        });
      }

      // Find today's block as current
      const todayIndex = blocks.findIndex(b => b.date === today);
      const currentBlock = todayIndex >= 0 ? blocks[todayIndex] : blocks[blocks.length - 1];

      const newChain: Blockchain = {
        id: `chain-${Date.now()}-${Math.random()}`,
        name,
        description,
        createdAt: Date.now(),
        state: {
          config: {
            startDate,
            criteria: initialCriteria,
            initialized: true,
          },
          blocks,
          currentBlock,
        },
      };

      setMultiState((prev) => ({
        chains: [...prev.chains, newChain],
        activeChainId: newChain.id,
      }));

      return newChain.id;
    },
    [setMultiState]
  );

  // Switch to a different chain
  const switchChain = useCallback(
    (chainId: string) => {
      setMultiState((prev) => ({
        ...prev,
        activeChainId: chainId,
      }));
    },
    [setMultiState]
  );

  // Rename a chain
  const renameChain = useCallback(
    (chainId: string, name: string, description?: string) => {
      setMultiState((prev) => ({
        ...prev,
        chains: prev.chains.map((c) =>
          c.id === chainId ? { ...c, name, description } : c
        ),
      }));
    },
    [setMultiState]
  );

  // Delete a chain
  const deleteChain = useCallback(
    (chainId: string) => {
      setMultiState((prev) => {
        const newChains = prev.chains.filter((c) => c.id !== chainId);
        const newActiveId =
          prev.activeChainId === chainId
            ? newChains.length > 0
              ? newChains[0].id
              : null
            : prev.activeChainId;

        return {
          chains: newChains,
          activeChainId: newActiveId,
        };
      });
    },
    [setMultiState]
  );

  // Update active chain state
  const updateActiveChainState = useCallback(
    (updater: (prev: BlockchainState) => BlockchainState) => {
      if (!activeChain) return;

      setMultiState((prev) => ({
        ...prev,
        chains: prev.chains.map((c) =>
          c.id === activeChain.id
            ? { ...c, state: updater(c.state) }
            : c
        ),
      }));
    },
    [activeChain, setMultiState]
  );

  // Add new criteria to active chain
  const addCriteria = useCallback(
    (criteria: Criteria) => {
      updateActiveChainState((prev) => ({
        ...prev,
        config: {
          ...prev.config,
          criteria: [...prev.config.criteria, criteria],
        },
      }));
    },
    [updateActiveChainState]
  );

  // Update existing criteria in active chain
  const updateCriteria = useCallback(
    (criteriaId: string, updates: Partial<Criteria>) => {
      updateActiveChainState((prev) => ({
        ...prev,
        config: {
          ...prev.config,
          criteria: prev.config.criteria.map((c) =>
            c.id === criteriaId ? { ...c, ...updates } : c
          ),
        },
      }));
    },
    [updateActiveChainState]
  );

  // Archive criteria
  const archiveCriteria = useCallback(
    (criteriaId: string) => {
      updateCriteria(criteriaId, { archived: true });
    },
    [updateCriteria]
  );

  // Toggle completion for a criteria in the current block
  const toggleCompletion = useCallback(
    (criteriaId: string) => {
      updateActiveChainState((prev) => {
        if (!prev.currentBlock || prev.currentBlock.mined) {
          return prev;
        }

        const updatedCompletions = prev.currentBlock.completions.map((c) =>
          c.criteriaId === criteriaId
            ? {
                ...c,
                completed: !c.completed,
                completedAt: !c.completed ? Date.now() : undefined,
              }
            : c
        );

        const fillPercentage = calculateFillPercentage(updatedCompletions, activeCriteria);

        const updatedCurrentBlock: Block = {
          ...prev.currentBlock,
          completions: updatedCompletions,
          fillPercentage,
        };

        const updatedBlocks = prev.blocks.map((b) =>
          b.blockNumber === updatedCurrentBlock.blockNumber ? updatedCurrentBlock : b
        );

        return {
          ...prev,
          currentBlock: updatedCurrentBlock,
          blocks: updatedBlocks,
        };
      });
    },
    [updateActiveChainState, activeCriteria]
  );

  // Update blocks when criteria change
  useEffect(() => {
    if (!state.config.initialized || !activeChain) return;

    updateActiveChainState((prev) => {
      const updatedBlocks = prev.blocks.map((block) => {
        if (block.mined) return block;

        const existingCriteriaIds = new Set(block.completions.map((c) => c.criteriaId));
        const newCompletions: CriteriaCompletion[] = activeCriteria
          .filter((c) => !existingCriteriaIds.has(c.id))
          .map((c) => ({
            criteriaId: c.id,
            completed: false,
          }));

        if (newCompletions.length === 0) return block;

        const allCompletions = [...block.completions, ...newCompletions];
        const fillPercentage = calculateFillPercentage(allCompletions, activeCriteria);

        return {
          ...block,
          completions: allCompletions,
          fillPercentage,
        };
      });

      const currentBlock =
        updatedBlocks.find((b) => b.blockNumber === prev.currentBlock?.blockNumber) || null;

      return {
        ...prev,
        blocks: updatedBlocks,
        currentBlock,
      };
    });
  }, [state.config.criteria, activeCriteria, updateActiveChainState, state.config.initialized, activeChain]);

  // Auto-mine blocks and create new ones daily
  useEffect(() => {
    if (!state.config.initialized || !activeChain) return;

    const checkInterval = setInterval(() => {
      updateActiveChainState((prev) => {
        if (!prev.currentBlock) return prev;

        const today = getDateString(new Date());
        const currentBlockMined = isBlockMined(prev.currentBlock.date);

        if (currentBlockMined || prev.currentBlock.date !== today) {
          const minedBlock: Block = {
            ...prev.currentBlock,
            mined: true,
          };

          let updatedBlocks = prev.blocks.map((b) =>
            b.blockNumber === minedBlock.blockNumber ? minedBlock : b
          );

          if (prev.currentBlock.date !== today) {
            // Check if we need to add future blocks
            const lastBlockDate = updatedBlocks[updatedBlocks.length - 1]?.date || today;
            const daysBetweenLastAndToday = getDaysBetween(lastBlockDate, today);
            
            // Add any missing blocks up to today + 7 days
            const newBlocks: Block[] = [];
            const daysSinceStart = getDaysBetween(prev.config.startDate, today);
            
            for (let offset = daysBetweenLastAndToday; offset <= 7; offset++) {
              const futureDate = new Date(today);
              futureDate.setDate(futureDate.getDate() + offset);
              const futureDateStr = getDateString(futureDate);
              
              // Check if block already exists
              if (!updatedBlocks.some(b => b.date === futureDateStr)) {
                const blockNumber = daysSinceStart + offset;
                const completions: CriteriaCompletion[] = activeCriteria.map((c) => ({
                  criteriaId: c.id,
                  completed: false,
                }));

                newBlocks.push({
                  blockNumber,
                  date: futureDateStr,
                  timestamp: futureDate.getTime(),
                  completions,
                  mined: false,
                  fillPercentage: 0,
                  hash: generateBlockHash(blockNumber, futureDateStr),
                });
              }
            }

            updatedBlocks = [...updatedBlocks, ...newBlocks];
            
            // Set current block to today's block
            const todayBlock = updatedBlocks.find(b => b.date === today);

            return {
              ...prev,
              blocks: updatedBlocks,
              currentBlock: todayBlock || updatedBlocks[updatedBlocks.length - 1],
            };
          }

          return {
            ...prev,
            blocks: updatedBlocks,
            currentBlock: minedBlock,
          };
        }

        return prev;
      });
    }, 60000);

    return () => clearInterval(checkInterval);
  }, [state.config.initialized, state.config.startDate, activeCriteria, updateActiveChainState, activeChain]);

  return {
    // Multi-chain management
    chains: multiState.chains,
    activeChain,
    createChain,
    switchChain,
    renameChain,
    deleteChain,

    // Active chain state
    state,
    activeCriteria,
    addCriteria,
    updateCriteria,
    archiveCriteria,
    toggleCompletion,
  };
}
