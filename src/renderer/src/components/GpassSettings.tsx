import { useEffect, useState } from 'react'

import { Card, Select, Form, message } from 'antd'

import { GpassBooth, GpassSite } from '@main/modules/bay/types/bay.type'

function GpassSettings(): JSX.Element {
  const [selectedSiteOid, setSelectedSiteOid] = useState<string | null>(null)
  const [sites, setSites] = useState<GpassSite[]>([])
  const [selectedBoothId, setSelectedBoothId] = useState<string | null>(null)
  const [booths, setBooths] = useState<GpassBooth[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadSites()
  }, [])

  const loadSites = async () => {
    try {
      setLoading(true)
      const data = await window.electron.getSiteList()
      setSites(data)
      const siteOid = await window.electron.getConfig('settings.gpass.siteOid')
      if (siteOid) {
        setSelectedSiteOid(siteOid)
        await loadBooths(siteOid)
      }
    } catch (error) {
      message.error('사이트 목록 로딩 실패')
    } finally {
      setLoading(false)
    }
  }

  const loadBooths = async (siteOid: string) => {
    try {
      setLoading(true)
      const data = await window.electron.getBoothList(siteOid)
      setBooths(data)
      setSelectedBoothId(await window.electron.getConfig('settings.gpass.boothId'))
    } catch (error) {
      message.error('부스 목록 로딩 실패')
    } finally {
      setLoading(false)
    }
  }

  const handleSiteChange = async (siteOid: string) => {
    try {
      const gpass = (await window.electron.getConfig('settings.gpass')) || {}
      await window.electron.setConfig('settings.gpass', {
        ...gpass,
        siteOid,
        siteName: sites.find(site => site.siteOid === siteOid)?.title,
      })
      setSelectedSiteOid(siteOid)
      await loadBooths(siteOid)
    } catch (error) {
      message.error('사이트 설정 실패')
    }
  }

  const handleBoothChange = async (boothId: string) => {
    try {
      const gpass = (await window.electron.getConfig('settings.gpass')) || {}
      await window.electron.setConfig('settings.gpass', {
        ...gpass,
        boothId,
        boothName: booths.find(booth => booth.boothId === boothId)?.title,
      })
      setSelectedBoothId(boothId)
    } catch (error) {
      message.error('부스 설정 실패')
    }
  }

  return (
    <Card title="고스트패스 설정" loading={loading}>
      <Form layout="vertical">
        <Form.Item label="사이트 선택">
          <Select
            placeholder="사이트를 선택하세요"
            onChange={handleSiteChange}
            style={{ width: '100%' }}
            value={selectedSiteOid}
          >
            {sites.map(site => (
              <Select.Option key={site.siteOid} value={site.siteOid}>
                {site.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="부스 선택">
          <Select
            placeholder="부스를 선택하세요"
            onChange={handleBoothChange}
            style={{ width: '100%' }}
            disabled={!sites.length}
            value={selectedBoothId}
          >
            {booths.map(booth => (
              <Select.Option key={booth.boothId} value={booth.boothId}>
                {booth.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default GpassSettings
