import { Injectable } from '@nestjs/common'

import { ConfigService } from '@main/modules/config/config.service'

import { GpassApiService } from '../services/gpass_api_service'
import type { IBayControlRepository, BayNode, GpassSite, GpassBooth } from '../types/bay.type'

@Injectable()
export class GpassBayControlRepository implements IBayControlRepository {
  private lastCallTime: Date | null = null
  private readonly SESSION_TIMEOUT = 60 * 60 * 1000 // 1시간

  constructor(
    private readonly gpassApiService: GpassApiService,
    private readonly configService: ConfigService,
  ) {
    // 테스트용 인증 정보
    const defaultPublicKey = process.env.GPASS_DEFAULT_PUBLIC_KEY?.replace(/\\n/g, '\n') || ''
    const authKey = process.env.GPASS_AUTH_KEY || ''
    const userId = process.env.GPASS_USER_ID || ''
    const password = process.env.GPASS_PASSWORD || ''

    gpassApiService.setKey(defaultPublicKey, authKey, userId, password)
  }

  private isSessionExpired(): boolean {
    if (!this.lastCallTime) return true
    const now = new Date()
    return now.getTime() - this.lastCallTime.getTime() >= this.SESSION_TIMEOUT
  }

  private updateLastCallTime(): void {
    this.lastCallTime = new Date()
  }

  async getSiteList(): Promise<GpassSite[]> {
    if (this.isSessionExpired()) {
      await this.initializeSession()
    }

    try {
      const response = await this.gpassApiService.getSiteList()
      this.updateLastCallTime()

      return (
        response.data.Item?.map(item => ({
          siteOid: item.site_oid,
          title: item.title,
          siteId: item.site_id,
          memo: item.memo,
        })) || []
      )
    } catch (error) {
      throw new Error('사이트 조회 실패')
    }
  }

  async getBoothList(siteOid?: string): Promise<GpassBooth[]> {
    if (siteOid === undefined) {
      throw new Error('사이트 ID가 필요합니다')
    }

    if (this.isSessionExpired()) {
      await this.initializeSession()
    }

    try {
      const response = await this.gpassApiService.getBoothList(siteOid)
      this.updateLastCallTime()

      return (
        response.data.Item?.map(item => ({
          boothOid: item.booth_oid,
          title: item.title,
          boothId: item.booth_id,
          memo: item.memo,
        })) || []
      )
    } catch (error) {
      throw new Error('노드 상태 조회 실패')
    }
  }

  async getNodeStatus(): Promise<BayNode[]> {
    const settings = this.configService.get('settings.gpass')
    const siteOid = settings?.siteOid
    const boothId = settings?.boothId

    if (!siteOid || !boothId) {
      throw new Error('사이트 ID와 부스 ID가 필요합니다')
    }

    if (this.isSessionExpired()) {
      await this.initializeSession()
    }

    try {
      const response = await this.gpassApiService.getRelayPointStatus(siteOid, boothId)
      this.updateLastCallTime()
      // return response.data.Item?.[0]?.rp?.map(item => ({
      //   id: item.point_id,
      //   name: item.name,
      //   status: item.point_status === 'ON'
      // })) || [];
      return this.mapToNodes(response.data.Item?.[0]?.rp || [])
    } catch (error) {
      throw new Error('노드 상태 조회 실패')
    }
  }

  async updateNodeStatus(id: string, status: boolean, nodes: BayNode[]): Promise<boolean> {
    const settings = this.configService.get('settings.gpass')
    const siteOid = settings?.siteOid
    const boothId = settings?.boothId

    if (!siteOid || !boothId) {
      throw new Error('사이트 ID와 부스 ID가 필요합니다')
    }

    if (this.isSessionExpired()) {
      await this.initializeSession()
    }

    try {
      await this.gpassApiService.updateRelayPoint(
        siteOid,
        boothId,
        nodes
          // 데이터가 많이 전송하면 적용에 시간이 오래 걸림(gpass), 바뀔 내용만 전송
          .filter(node => node.id === id || node.status)
          .map(node => ({
            point_id: node.id,
            status: node.id === id ? (status ? 'ON' : 'OFF') : 'OFF',
          })),
      )
      this.updateLastCallTime()
      return true
    } catch (error) {
      console.error(error)
      throw new Error('노드 상태 업데이트 실패')
    }
  }

  private mapToNodes(rawData: any[]): BayNode[] {
    return rawData.map(item => ({
      id: item.point_id,
      name: item.name,
      status: item.point_status === 'ON',
    }))
  }

  private async initializeSession(): Promise<void> {
    try {
      const session = await this.gpassApiService.getSession()
      this.gpassApiService.setApiKey(
        session.data.SessionID,
        `${session.data.ProfileOid}`,
        session.data.PublicKey,
      )
      this.updateLastCallTime()
    } catch (error) {
      throw new Error('세션 초기화 실패')
    }
  }
}
