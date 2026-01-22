// MUI Imports
import Grid from '@mui/material/Grid2'
import DocumentsTab from '@views/kyc/userManagement/userManagementDetailPage/components/DocumentsTab'
import ProcessThirdPartyTab from '@views/kyc/userManagement/userManagementDetailPage/components/ThirdPartyStatusTab'

// Types
interface VerificationTabProps {
  info: any
}

const VerificationTab = ({ info }: VerificationTabProps) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <div className='flex flex-col gap-6'>
          {/* Sumsub Verification Status */}
          <ProcessThirdPartyTab
            applicantId={info?.member?.inspection_id}
            sumsubData={info?.sumsub ? { sumsub: info.sumsub } : undefined}
          />
          <DocumentsTab documents={info?.documents ?? []} />
        </div>
      </Grid>
    </Grid>
  )
}

export default VerificationTab
