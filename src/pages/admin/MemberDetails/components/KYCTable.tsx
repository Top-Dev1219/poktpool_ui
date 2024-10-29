import { useMutation } from 'react-query'
import axios from 'axios'
import {
  CircularProgress,
  Button,
} from '@mui/material'
import useAccessToken from '../../../../../hooks/useAccessToken'
import { Box } from '@mui/system'

export const KYCTable = ({ memberDetailData, refetchMemberDetails }: { memberDetailData: any, refetchMemberDetails: any }) => {
  const accessToken = useAccessToken();
  const userEmail = memberDetailData?.email;
  const { mutate: approveKYC, isLoading: isLoadingApproveKYC } = useMutation(
    () => axios.post(
        `admin-member/approve-kyc`,
        { email: userEmail },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      ),
    {
      onSuccess: () => refetchMemberDetails(),
      onError: (error: any) => {
        console.log(error);
      },
    }
  );
  const { mutate: rejectKYC, isLoading: isLoadingRejectKYC } = useMutation(
    () => axios.post(
        `admin-member/reject-kyc`,
        { email: userEmail },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      ),
    {
      onSuccess: () => refetchMemberDetails(),
      onError: (error: any) => {
        console.log(error);
      },
    }
  );
  const { mutate: resetKYC, isLoading: isLoadingResetKYC } = useMutation(
    () => axios.post(
        `admin-member/reset-kyc`,
        { email: userEmail },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      ),
    {
      onSuccess: () => refetchMemberDetails(),
      onError: (error: any) => {
        console.log(error);
      },
    }
  );

  if (!memberDetailData) {
    return (
      <div className="flex justify-center">
        <CircularProgress />
      </div>
    )
  }

  const { jumio_decision, jumio_reason, jumio_allow_retry } = memberDetailData;

  if (!jumio_decision) {
    return (
      <div>
        <h3>Status</h3>
        <div>
          Not completed
        </div>
      </div>
    )
  }

  const isLoading = isLoadingApproveKYC || isLoadingRejectKYC || isLoadingResetKYC;
  return (
    <div>      
      <h3>Status</h3>
      <div>
        {jumio_decision}
      </div>
      <Box sx={{mt: 2}}>
        <Button
          disabled={isLoading || jumio_decision === 'PASSED'}
          color='primary'
          variant='contained'
          onClick={() => approveKYC()}
        >
          Approve
        </Button>
        &nbsp;&nbsp;&nbsp;
        <Button
          disabled={isLoading || jumio_decision !== 'PASSED'}
          color='warning'
          variant="contained"
          onClick={() => rejectKYC()}
        >
          Reject
        </Button>
      </Box>
      {jumio_decision !== 'PASSED' && (
        <>
          <h3>Retry allowed</h3>
          <div>
            {jumio_allow_retry ? 'Yes' : 'No'}
          </div>
          {!jumio_allow_retry && (
            <Box sx={{mt: 2}}>
              <Button
                disabled={isLoading}
                color='primary'
                variant='contained'
                onClick={() => resetKYC()}
              >
                Allow Retry
              </Button>
            </Box>
          )}
        </>
      )}
    </div>
  )
}
