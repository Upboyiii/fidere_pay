// Component Imports
import Payment from '@views/front-pages/Payment'

// Data Imports
import { getPublicPricingData } from '@/app/server/actions'

const PaymentPage = async () => {
  // Vars
  const data = await getPublicPricingData()

  return <Payment data={data} />
}

export default PaymentPage
