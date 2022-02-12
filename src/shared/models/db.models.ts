export interface CreateQueryData {
  keys: string;
  refs: string;
  values: unknown[];
}

export interface UpdateQueryData {
  keysAndRefs: string;
  values: unknown[];
}
