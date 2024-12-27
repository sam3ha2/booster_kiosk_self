import useSWR from 'swr'

function Versions(): JSX.Element {
  const { data: versions } = useSWR('versions', window.electron.getVersions)
  const { data: appVersion } = useSWR('appVersion', window.electron.getAppVersion)

  return (
    <ul className="versions">
      <li className="app-version">App v{appVersion}</li>
      <li className="electron-version">Electron v{versions?.electron}</li>
      <li className="chrome-version">Chromium v{versions?.chrome}</li>
      <li className="node-version">Node v{versions?.node}</li>
    </ul>
  )
}

export default Versions
