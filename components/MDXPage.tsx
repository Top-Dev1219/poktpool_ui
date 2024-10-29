import { PropsWithChildren } from 'react'
import axios from 'axios'
import PageLayout from '../components/PageLayout'
import { useQuery } from 'react-query'

export default function MDXPage({
  children,
  showTitle = true,
  title,
}: PropsWithChildren<{ showTitle: boolean; title: string }>) {
  // API health check to catch 502/503 server error
  const { data: apiHealthCheck } = useQuery('api/health-check', () => {
    ;(async () => {
      try {
        await axios.get('health')
      } catch (error) {
        console.error(error)
      }
    })()
  })

  return (
    <PageLayout title={title}>
      <section className="prose mx-auto">
        {showTitle && <h1>{title}</h1>}
        {children}
      </section>
    </PageLayout>
  )
}
