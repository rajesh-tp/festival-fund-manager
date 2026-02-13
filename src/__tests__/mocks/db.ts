import { vi } from "vitest";

function createChain() {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  const methods = ["select", "from", "where", "set", "values", "orderBy", "groupBy", "limit", "insert", "update", "delete"];

  for (const method of methods) {
    chain[method] = vi.fn(() => chain);
  }

  chain.get = vi.fn();
  chain.all = vi.fn(() => []);
  chain.run = vi.fn();
  chain.mapWith = vi.fn(() => chain);

  return chain;
}

export function createMockDb() {
  const selectChain = createChain();
  const insertChain = createChain();
  const updateChain = createChain();
  const deleteChain = createChain();

  return {
    select: vi.fn(() => selectChain),
    insert: vi.fn(() => insertChain),
    update: vi.fn(() => updateChain),
    delete: vi.fn(() => deleteChain),
    _selectChain: selectChain,
    _insertChain: insertChain,
    _updateChain: updateChain,
    _deleteChain: deleteChain,
  };
}
