import { Injectable } from '@nestjs/common'

import { ConfigService } from '@main/modules/config/config.service'
import type { ConfigStoreValues } from '@main/modules/config/config.store'
import { IPCHandle } from '@main/modules/electron/decorators/ipc-handle.decorator'

@Injectable()
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @IPCHandle()
  public getAllConfig() {
    return this.configService.getAll()
  }

  @IPCHandle()
  public setAllConfig(config: ConfigStoreValues) {
    return this.configService.setAll(config)
  }

  @IPCHandle()
  public getConfig(key: any) {
    return this.configService.get(key)
  }

  @IPCHandle()
  public setConfig(key: any, value: any) {
    return this.configService.set(key, value)
  }
}
