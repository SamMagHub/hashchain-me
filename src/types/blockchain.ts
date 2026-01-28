export interface Criteria {
  id: string;
  name: string;
  description: string;
  type: 'goal' | 'prohibition'; // goal = should do, prohibition = should NOT do
  createdAt: number;
  archived?: boolean;
}

export interface CriteriaCompletion {
  criteriaId: string;
  completed: boolean;
  completedAt?: number;
}

export interface Block {
  blockNumber: number;
  date: string; // YYYY-MM-DD format
  timestamp: number;
  completions: CriteriaCompletion[];
  mined: boolean; // true after 24 hours have elapsed
  fillPercentage: number; // 0-100, calculated from completions
  hash?: string; // optional hash for visual effect
}

export interface BlockchainConfig {
  startDate: string; // YYYY-MM-DD format
  criteria: Criteria[];
  initialized: boolean;
}

export interface BlockchainState {
  config: BlockchainConfig;
  blocks: Block[];
  currentBlock: Block | null;
}

// Blockchain with metadata for multi-chain support
export interface Blockchain {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  state: BlockchainState;
}

// Multi-chain storage structure
export interface MultiChainState {
  chains: Blockchain[];
  activeChainId: string | null;
}

// Helper to calculate block fill percentage
export function calculateFillPercentage(
  completions: CriteriaCompletion[],
  activeCriteria: Criteria[]
): number {
  if (activeCriteria.length === 0) return 0;
  
  const completedCount = completions.filter((c) => {
    const criteria = activeCriteria.find((ac) => ac.id === c.criteriaId);
    if (!criteria) return false;
    
    // For goals: completed = true means success
    // For prohibitions: completed = false means success (didn't do the bad thing)
    return criteria.type === 'goal' ? c.completed : !c.completed;
  }).length;
  
  return Math.round((completedCount / activeCriteria.length) * 100);
}

// Helper to generate a pseudo-hash for visual effect
export function generateBlockHash(blockNumber: number, date: string): string {
  const combined = `${blockNumber}-${date}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}
