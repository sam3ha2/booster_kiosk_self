import { IBayControlRepository, BayNode, GpassBooth, GpassSite } from '../types/bay.type'

export class MockBayControlRepository implements IBayControlRepository {
  private nodes: BayNode[] = [
    { id: '1', name: '고압수', status: false },
    { id: '2', name: '샴푸', status: false },
    { id: '3', name: '왁스', status: false },
  ]

  async getNodeStatus(): Promise<BayNode[]> {
    return [...this.nodes]
  }

  async updateNodeStatus(id: string, status: boolean): Promise<boolean> {
    const node = this.nodes.find(p => p.id === id)
    if (node) {
      node.status = status
      return true
    }
    return false
  }

  getSiteList(): Promise<GpassSite[]> {
    throw new Error('Method not implemented.')
  }

  getBoothList(): Promise<GpassBooth[]> {
    throw new Error('Method not implemented.')
  }
}
