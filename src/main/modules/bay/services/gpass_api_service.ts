import { Inject, Injectable } from '@nestjs/common'
import axios, { AxiosInstance } from 'axios'
import crypto from 'crypto'
import { DOMParser } from 'xmldom'
import log from 'electron-log'

export interface GpassApiServiceInterface {
  axiosInstance: AxiosInstance
  defaultPublicKey: string
  authKey: string
  userId: string
  password: string
  sessionId: string
  secureKey: string
  publicKey: string
}

@Injectable()
export class GpassApiService implements GpassApiServiceInterface {
  public axiosInstance: AxiosInstance
  public defaultPublicKey: string
  public authKey: string
  public userId: string
  public password: string
  public sessionId: string
  public secureKey: string
  public publicKey: string

  constructor(
    @Inject('GPASS_API_URL')
    readonly gpassApiUrl: string,
  ) {
    this.axiosInstance = axios.create({
      baseURL: gpassApiUrl,
      headers: {
        'Content-Type': 'text/xml',
      },
    })

    // 초기값 설정
    this.defaultPublicKey = ''
    this.authKey = ''
    this.userId = ''
    this.password = ''
    this.sessionId = ''
    this.secureKey = ''
    this.publicKey = ''

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(request => {
      return request
    })

    this.axiosInstance.interceptors.response.use(response => {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(response.data, 'text/xml')

      const resultElement = xmlDoc.getElementsByTagName('Result')[0]
      if (!resultElement) {
        throw new Error('응답에서 Result를 찾을 수 없습니다')
      }

      const jsonResult = JSON.parse(resultElement.textContent || '{}')
      response.data = jsonResult

      return response
    })
  }

  public setKey(defaultPublicKey: string, authKey: string, userId: string, password: string): void {
    this.defaultPublicKey = defaultPublicKey
    this.authKey = authKey
    this.userId = userId
    this.password = password
  }

  public setApiKey(sessionId: string, secureKey: string, publicKey: string): void {
    this.sessionId = sessionId
    this.secureKey = secureKey
    this.publicKey = publicKey
  }

  private getEncrtypedData(data: string, publicKey: string): string {
    try {
      const encryptBuffer = crypto.publicEncrypt(
        {
          key: publicKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha1',
        },
        Buffer.from(data),
      )

      return encryptBuffer.toString('base64')
    } catch (error) {
      log.error('암호화 오류:', error)
      throw error
    }
  }

  public async getSession() {
    const _authKey = this.getEncrtypedData(this.authKey, this.defaultPublicKey)
    const _password = this.getEncrtypedData(this.password, this.defaultPublicKey)
    const soapelope = `
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Header/>
        <soap:Body>
          <Cert xmlns="http://tempuri.org/">
            <AuthKeyEncD>${_authKey}</AuthKeyEncD>
            <PasswordEncD>${_password}</PasswordEncD>
            <InputJSON>{"request":{"id":"${this.userId}"}}</InputJSON>
            <Mode>GET_SESSION</Mode>
          </Cert>
        </soap:Body>
      </soap:Envelope>`

    return await this.axiosInstance.post('', soapelope)
  }

  public async getSiteList() {
    const _authKey = this.getEncrtypedData(this.authKey, this.defaultPublicKey)
    const _sessionId = this.getEncrtypedData(this.sessionId, this.publicKey)
    const _secureKey = this.getEncrtypedData(this.secureKey, this.defaultPublicKey)
    const soapelope = `
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Header/>
        <soap:Body>
          <GetDataJSON xmlns="http://tempuri.org/">
            <AuthKeyEncD>${_authKey}</AuthKeyEncD>
            <SessionIDEncN>${_sessionId}</SessionIDEncN>
            <SecureKeyEncD>${_secureKey}</SecureKeyEncD>
            <InputJSON>{}</InputJSON>
            <Mode>GET_SITE_LIST</Mode>
          </GetDataJSON>
        </soap:Body>
      </soap:Envelope>`

    return this.axiosInstance.post('', soapelope)
  }

  public async getBoothList(siteOid: string) {
    const _authKey = this.getEncrtypedData(this.authKey, this.defaultPublicKey)
    const _sessionId = this.getEncrtypedData(this.sessionId, this.publicKey)
    const _secureKey = this.getEncrtypedData(this.secureKey, this.defaultPublicKey)
    const inputJSON = JSON.stringify({
      request: {
        site_oid: siteOid,
      },
    })

    const soapelope = `
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Header/>
        <soap:Body>
          <GetDataJSON xmlns="http://tempuri.org/">
            <AuthKeyEncD>${_authKey}</AuthKeyEncD>
            <SessionIDEncN>${_sessionId}</SessionIDEncN>
            <SecureKeyEncD>${_secureKey}</SecureKeyEncD>
            <InputJSON>${inputJSON}</InputJSON>
            <Mode>GET_BOOTH_LIST</Mode>
          </GetDataJSON>
        </soap:Body>
      </soap:Envelope>`

    return this.axiosInstance.post('', soapelope)
  }

  public async getRelayPointStatus(siteOid: string, boothId: string) {
    const _authKey = this.getEncrtypedData(this.authKey, this.defaultPublicKey)
    const _sessionId = this.getEncrtypedData(this.sessionId, this.publicKey)
    const _secureKey = this.getEncrtypedData(this.secureKey, this.defaultPublicKey)
    const inputJSON = JSON.stringify({
      request: {
        site_oid: siteOid,
        booth_id: boothId,
      },
    })

    const soapelope = `
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Header/>
        <soap:Body>
          <GetDataJSON xmlns="http://tempuri.org/">
            <AuthKeyEncD>${_authKey}</AuthKeyEncD>
            <SessionIDEncN>${_sessionId}</SessionIDEncN>
            <SecureKeyEncD>${_secureKey}</SecureKeyEncD>
            <InputJSON>${inputJSON}</InputJSON>
            <Mode>GET_RELAY_POINT_STATUS</Mode>
          </GetDataJSON>
        </soap:Body>
      </soap:Envelope>`

    return this.axiosInstance.post('', soapelope)
  }

  public async updateRelayPoint(siteOid: string, boothId: string, pointList: any[]) {
    const _authKey = this.getEncrtypedData(this.authKey, this.defaultPublicKey)
    const _sessionId = this.getEncrtypedData(this.sessionId, this.publicKey)
    const _secureKey = this.getEncrtypedData(this.secureKey, this.defaultPublicKey)
    const inputJSON = JSON.stringify({
      request: {
        site_oid: siteOid,
        booth_id: boothId,
        list: pointList,
      },
    })

    const soapelope = `
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Header/>
        <soap:Body>
          <UpdateDataJSON xmlns="http://tempuri.org/">
            <AuthKeyEncD>${_authKey}</AuthKeyEncD>
            <SessionIDEncN>${_sessionId}</SessionIDEncN>
            <SecureKeyEncD>${_secureKey}</SecureKeyEncD>
            <InputJSON>${inputJSON}</InputJSON>
            <Mode>UPDATE_RELAY_POINT</Mode>
          </UpdateDataJSON>
        </soap:Body>
      </soap:Envelope>`

    return this.axiosInstance.post('', soapelope)
  }
}
