import { Inject, Injectable } from '@nestjs/common'

import type { IBayControlRepository, BayNode } from './types/bay.type'

@Injectable()
export class BayService {
  constructor(
    @Inject('IBayControlRepository')
    private readonly repository: IBayControlRepository,
  ) {}

  async getSiteList() {
    return await this.repository.getSiteList()
  }

  async getBoothList(siteOid: string) {
    return await this.repository.getBoothList(siteOid)
  }

  async getNodeStatus(): Promise<BayNode[]> {
    return await this.repository.getNodeStatus()
  }

  async toggleNode(nodeId: string): Promise<boolean> {
    const nodes = await this.getNodeStatus()
    const node = nodes.find(p => p.id === nodeId)
    if (!node) throw new Error('노드를 찾을 수 없습니다.')

    const newStatus = !node.status
    return await this.repository.updateNodeStatus(nodeId, newStatus, nodes)
  }
}
