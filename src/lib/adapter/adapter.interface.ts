export interface IAdapterStore {
  storeKey: string;
  write(key: string, value: number): Promise<number>;
  read(key: string): Promise<number>;
  clear(): number;
}
