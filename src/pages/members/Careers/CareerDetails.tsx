import { useRouter } from 'next/router'
import PageLayout from '../../../../components/PageLayout'
import {
  MarketingDirector,
  QAEngineer,
  JrFrontendEngineer,
  SQLDeveloper,
} from './components'

export const CareerDetails = () => {
  const router = useRouter()

  const RenderComponent = () => {
    switch (router.query.slug) {
      case 'jr-frontend-engineer':
        return <JrFrontendEngineer />
      case 'sql-developer':
        return <SQLDeveloper />
      case 'marketing-director':
        return <MarketingDirector />
      default:
        break
    }
  }

  return (
    <PageLayout title="Career Detail">
      <div className="max-w-5xl mx-auto careers">{RenderComponent()}</div>
    </PageLayout>
  )
}
