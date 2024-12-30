import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { SettingOutlined } from '@ant-design/icons'
import { Card, Button, List, Tag, Spin, message, Space } from 'antd'

import type { BayNode } from '@main/modules/bay/types/bay.type'
import { wait } from '@main/utils/promise.utils'

function BayControlPage(): JSX.Element {
  const navigate = useNavigate()
  const [bayName, setBayName] = useState('')
  const [nodes, setNodes] = useState<BayNode[]>([])
  const [loading, setLoading] = useState(false)

  const fetchNodes = async () => {
    const settings: any = await window.electron.getConfig('settings')
    try {
      if (settings.mode === 'GPASS') {
        setBayName(`${settings.gpass.siteName} - ${settings.gpass.boothName}`)
      } else {
        setBayName(`${settings.shopName} - ${settings.bayName}`)
      }
      setLoading(true)
      const nodes = await window.electron.getNodeStatus()
      console.log(nodes)
      setNodes(nodes)
    } catch (error) {
      message.error(`노드 상태 조회 실패: ${error}`)
      if (
        settings.mode === null ||
        (settings.mode === 'GPASS' && (!settings.gpass.siteOid || !settings.gpass.boothId))
      ) {
        await wait(1)
        navigate('/admin', { replace: true })
        return
      }
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (nodeId: string) => {
    try {
      setLoading(true)
      await window.electron.toggleNode(nodeId)
      await fetchNodes() // 상태 갱신
    } catch (error) {
      message.error('노드 상태 변경 실패')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNodes()
  }, [])

  return (
    <Card
      title={bayName}
      extra={
        <Space>
          <Button onClick={fetchNodes}>새로고침</Button>
          <Button type="text" icon={<SettingOutlined />} onClick={() => navigate('/admin')} />
        </Space>
      }
    >
      <Spin spinning={loading}>
        <List
          grid={{ gutter: 16, column: 2 }}
          dataSource={nodes}
          renderItem={node => (
            <List.Item key={node.id}>
              <Card
                size="small"
                style={{
                  border: `1px solid ${node.status ? '#1890ff' : '#d9d9d9'}`,
                  cursor: 'pointer',
                }}
                onClick={() => handleToggle(node.id)}
              >
                <List.Item.Meta
                  title={`${node.id} - ${node.name ?? ''}`}
                  description={
                    <Tag color={node.status ? 'green' : 'red'} style={{ cursor: 'pointer' }}>
                      {node.status ? 'ON' : 'OFF'}
                    </Tag>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      </Spin>
    </Card>
  )
}

export default BayControlPage
