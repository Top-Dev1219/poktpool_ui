import { Construction } from '@mui/icons-material'
import Image from 'next/image'
import { POKTPOOL_STRING } from '../../src/constants'
import poktpoolLogo from '../../public/images/poktpool-logo.png'

export default function MaintenanceMode() {
  return (
    <div className="flex items-center justify-center text-center h-screen">
      <div>
        <div className="w-2/3 mx-auto">
          <video autoPlay loop muted style={{ width: '100%' }}>
            <source
              src="/images/maintenance-video-white.mp4"
              type="video/mp4"
            />
          </video>
        </div>
        <h2 className="my-0">
          We are working on some maintenance at the moment and will be back!
        </h2>
      </div>
    </div>
  )
}
