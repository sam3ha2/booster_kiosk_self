import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button, Card, Radio, Space, message } from 'antd'

import { BayMode } from '@main/modules/config/config.store'

import GpassSettings from '../components/GpassSettings'

function AdminPage(): JSX.Element {
  const navigate = useNavigate()
  const [mode, setMode] = useState<BayMode | null>(null)

  useEffect(() => {
    // 현재 설정된 모드 불러오기
    window.electron.getConfig('settings.mode').then(currentMode => {
      if (currentMode) setMode(currentMode)
    })
  }, [])

  const handleModeChange = async (newMode: BayMode) => {
    try {
      setMode(newMode)
      await window.electron.setConfig('settings.mode', String(newMode))
    } catch (error) {
      message.error('설정 변경 실패')
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="운영 모드 설정">
          <Radio.Group value={mode} onChange={e => handleModeChange(e.target.value)}>
            <Space direction="vertical">
              <Radio value="GPASS">고스트패스 모드</Radio>
              {/* <Radio value="LOCAL">로컬 모드</Radio> */}
            </Space>
          </Radio.Group>
        </Card>

        {mode === 'GPASS' && <GpassSettings />}

        {mode !== null && (
          <Button
            type="primary"
            onClick={async () => {
              if (mode === 'GPASS') {
                const gpass = await window.electron.getConfig('settings.gpass')
                if (!gpass || !gpass.siteOid || !gpass.boothId) {
                  message.error('고스트패스 설정이 필요합니다')
                  return
                }
              }
              if (mode === 'LOCAL') {
                window.electron.setConfig('settings.gpass', null)
              }
              navigate('/')
            }}
            style={{ width: '100%' }}
          >
            완료
          </Button>
        )}
      </Space>
    </div>
  )
}

export default AdminPage
