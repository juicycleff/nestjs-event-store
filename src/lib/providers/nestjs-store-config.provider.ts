import { EventStoreModuleOptions } from '../contract';

export class NestStoreConfigProvider {
  private readonly esConfig: EventStoreModuleOptions;
  constructor(option: EventStoreModuleOptions) {
    this.esConfig = option;
  }

  get eventSourceConfig(): EventStoreModuleOptions {
    return this.esConfig;
  }
}
