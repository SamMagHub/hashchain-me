import { useCallback, useEffect, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  Block,
  BlockchainConfig,
  BlockchainState,
  Criteria,
  CriteriaCompletion,
  calculateFillPercentage,
  generateBlockHash,
} from '@/types/blockchain';

const STORAGE_KEY = 'blockchain-state';

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

const defaultState: BlockchainState = {
  config: {
    startDate: '',
    criteria: [],
    initialized: false,
  },
  blocks: [],
  currentBlock: null,
};

export function useBlockchain() {
  const [state, setState] = useLocalStorage<BlockchainState>(STORAGE_KEY, defaultState);

  // Get active (non-archived) criteria
  const activeCriteria = useMemo(
    () => state.config.criteria.filter((c) => !c.archived),
    [state.config.criteria]
  );

  // Initialize blockchain with start date and initial criteria
  const initialize = useCallback(
    (startDate: string, initialCriteria: Criteria[]) => {
      const blocks: Block[] = [];
      const today = getDateString(new Date());
      const daysSinceStart = getDaysBetween(startDate, today);

      // Create blocks for each day from start to today
      for (let i = 0; i <= daysSinceStart; i++) {
        const blockDate = new Date(startDate);
        blockDate.setDate(blockDate.getDate() + i);
        const dateStr = getDateString(blockDate);
        
        const completions: CriteriaCompletion[] = initialCriteria.map((c) => ({
          criteriaId: c.id,
          completed: false,
        }));

        const mined = isBlockMined(dateStr);
        const fillPercentage = mined ? 0 : 0; // Past blocks default to 0% if not completed

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

      const currentBlock = blocks[blocks.length - 1];

      setState({
        config: {
          startDate,
          criteria: initialCriteria,
          initialized: true,
        },
        blocks,
        currentBlock,
      });
    },
    [setState]
  );

  // Add new criteria
  const addCriteria = useCallback(
    (criteria: Criteria) => {
      setState((prev) => ({
        ...prev,
        config: {
          ...prev.config,
          criteria: [...prev.config.criteria, criteria],
        },
      }));
    },
    [setState]
  );

  // Update existing criteria
  const updateCriteria = useCallback(
    (criteriaId: string, updates: Partial<Criteria>) => {
      setState((prev) => ({
        ...prev,
        config: {
          ...prev.config,
          criteria: prev.config.criteria.map((c) =>
            c.id === criteriaId ? { ...c, ...updates } : c
          ),
        },
      }));
    },
    [setState]
  );

  // Archive criteria (soft delete)
  const archiveCriteria = useCallback(
    (criteriaId: string) => {
      updateCriteria(criteriaId, { archived: true });
    },
    [updateCriteria]
  );

  // Toggle completion for a criteria in the current block
  const toggleCompletion = useCallback(
    (criteriaId: string) => {
      setState((prev) => {
        if (!prev.currentBlock || prev.currentBlock.mined) {
          return prev; // Can't modify mined blocks
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
    [setState, activeCriteria]
  );

  // Mine current block and create new one if needed
  const mineCurrentBlock = useCallback(() => {
    setState((prev) => {
      if (!prev.currentBlock) return prev;

      const today = getDateString(new Date());
      
      // Mark current block as mined
      const minedBlock: Block = {
        ...prev.currentBlock,
        mined: true,
      };

      let updatedBlocks = prev.blocks.map((b) =>
        b.blockNumber === minedBlock.blockNumber ? minedBlock : b
      );

      // Check if we need to create a new block for today
      const latestBlockDate = updatedBlocks[updatedBlocks.length - 1].date;
      
      if (latestBlockDate !== today) {
        // Create new block for today
        const newBlockNumber = updatedBlocks.length;
        const completions: CriteriaCompletion[] = activeCriteria.map((c) => ({
          criteriaId: c.id,
          completed: false,
        }));

        const newBlock: Block = {
          blockNumber: newBlockNumber,
          date: today,
          timestamp: new Date().getTime(),
          completions,
          mined: false,
          fillPercentage: 0,
          hash: generateBlockHash(newBlockNumber, today),
        };

        updatedBlocks = [...updatedBlocks, newBlock];

        return {
          ...prev,
          blocks: updatedBlocks,
          currentBlock: newBlock,
        };
      }

      return {
        ...prev,
        blocks: updatedBlocks,
        currentBlock: minedBlock,
      };
    });
  }, [setState, activeCriteria]);

  // Update blocks when criteria change (add new completions for new criteria)
  useEffect(() => {
    if (!state.config.initialized) return;

    setState((prev) => {
      const updatedBlocks = prev.blocks.map((block) => {
        // Don't modify mined blocks
        if (block.mined) return block;

        // Add completions for any new criteria
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

      const currentBlock = updatedBlocks.find((b) => b.blockNumber === prev.currentBlock?.blockNumber) || null;

      return {
        ...prev,
        blocks: updatedBlocks,
        currentBlock,
      };
    });
  }, [state.config.criteria, activeCriteria, setState, state.config.initialized]);

  // Auto-mine blocks and create new ones daily
  useEffect(() => {
    if (!state.config.initialized) return;

    const checkInterval = setInterval(() => {
      setState((prev) => {
        if (!prev.currentBlock) return prev;

        const today = getDateString(new Date());
        const currentBlockMined = isBlockMined(prev.currentBlock.date);

        // If current block should be mined or we're on a new day
        if (currentBlockMined || prev.currentBlock.date !== today) {
          const minedBlock: Block = {
            ...prev.currentBlock,
            mined: true,
          };

          let updatedBlocks = prev.blocks.map((b) =>
            b.blockNumber === minedBlock.blockNumber ? minedBlock : b
          );

          // Create new block if needed
          if (prev.currentBlock.date !== today) {
            const daysSinceStart = getDaysBetween(prev.config.startDate, today);
            const newBlockNumber = daysSinceStart;

            const completions: CriteriaCompletion[] = activeCriteria.map((c) => ({
              criteriaId: c.id,
              completed: false,
            }));

            const newBlock: Block = {
              blockNumber: newBlockNumber,
              date: today,
              timestamp: new Date().getTime(),
              completions,
              mined: false,
              fillPercentage: 0,
              hash: generateBlockHash(newBlockNumber, today),
            };

            updatedBlocks = [...updatedBlocks, newBlock];

            return {
              ...prev,
              blocks: updatedBlocks,
              currentBlock: newBlock,
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
    }, 60000); // Check every minute

    return () => clearInterval(checkInterval);
  }, [state.config.initialized, state.config.startDate, activeCriteria, setState]);

  return {
    state,
    activeCriteria,
    initialize,
    addCriteria,
    updateCriteria,
    archiveCriteria,
    toggleCompletion,
    mineCurrentBlock,
  };
}
