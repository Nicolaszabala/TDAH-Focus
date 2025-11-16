/**
 * ADHD Knowledge Base - Main Export
 *
 * Centralized export for all knowledge base modules
 * Use this for importing knowledge base in other parts of the app
 */

// Full knowledge base
export {
  ADHD_KNOWLEDGE,
  getADHDKnowledge,
  getKnowledgeSection,
} from './adhdKnowledgeBase';

// Optimized knowledge base (for offline assistant)
export {
  getCoreKnowledge,
  getPatternKnowledge,
  detectPattern,
  getOptimizedKnowledge,
  CORE_ADHD_KNOWLEDGE,
  MATE_CORE_CONCEPTS,
  PATTERN_KNOWLEDGE,
} from './adhdKnowledgeOptimized';

// Scattered Minds concepts
export { SCATTERED_MINDS_CONCEPTS } from './scatteredMindsConcepts';

// Re-export default from optimized (most commonly used)
export { default } from './adhdKnowledgeOptimized';
