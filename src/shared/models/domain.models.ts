export type BaseEntity = {
  /**
   * ID is optional because it may be generated client-side, if not it will be provided by the server.
   */
  id?: string;
  created_at: Date;
  updated_at?: Date;
};
