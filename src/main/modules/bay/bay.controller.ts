import { Controller } from '@nestjs/common'

import { IPCHandle } from '@main/modules/electron/decorators/ipc-handle.decorator'

import { BayService } from './bay.service'
import type { BayNode, GpassBooth, GpassSite } from './types/bay.type'

@Controller()
export class BayController {
  constructor(private readonly bayService: BayService) {}

  @IPCHandle()
  public async getSiteList(): Promise<GpassSite[]> {
    return await this.bayService.getSiteList()
  }

  @IPCHandle()
  public async getBoothList(siteOid: string): Promise<GpassBooth[]> {
    return await this.bayService.getBoothList(siteOid)
  }

  @IPCHandle()
  public async getNodeStatus(): Promise<BayNode[]> {
    return await this.bayService.getNodeStatus()
  }

  @IPCHandle()
  public async toggleNode(nodeId: string): Promise<boolean> {
    return await this.bayService.toggleNode(nodeId)
  }
}
