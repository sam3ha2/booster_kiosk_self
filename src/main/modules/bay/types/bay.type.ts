export interface BayNode {
  id: string
  name: string
  status: boolean
}

export interface GpassSite {
  siteOid: string
  title: string
  siteId: string
  memo: string
}

export interface GpassBooth {
  boothOid: string
  title: string
  boothId: string
  memo: string
}

export interface IBayControlRepository {
  getNodeStatus(): Promise<BayNode[]>
  updateNodeStatus(id: string, status: boolean, nodes: BayNode[]): Promise<boolean>

  getSiteList(): Promise<GpassSite[]>
  getBoothList(siteOid: string): Promise<GpassBooth[]>
}
