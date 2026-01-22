// Component Imports
import PricingWrapper from '@/views/front-pages/pricing'

// Data Imports
import { getPublicPricingData } from '@/app/server/actions'

const PricingPage = async () => {
  // Vars
  const data = await getPublicPricingData()

  return <PricingWrapper data={data} />
}

export default PricingPage
