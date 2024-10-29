import { useEffect, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useQuery, useMutation } from 'react-query'
import axios from 'axios'
import {
  Typography,
  Button,
  Box,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
  Snackbar,
  TableContainer,
  Table,
  Paper,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Autocomplete,
  Checkbox,
  Skeleton,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import useAccessToken from '../../../../hooks/useAccessToken'

interface Payload {
  segment_id: number
  infra_rate: number
  ppinc_commission_rate: number
}

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
const checkedIcon = <CheckBoxIcon fontSize="small" />

export const RoleAdmin = () => {
  const router = useRouter()
  const accessToken = useAccessToken()
  const { status, data: sessionData } = useSession()
  const [poolId, setPoolId] = useState<string>('')
  const [roleId, setRoleId] = useState<string>('')
  const [roleList, setRoleList] = useState<any[]>([])
  const [showSuccessMsg, setShowSuccessMsg] = useState(false)
  const [hasPatchError, setHasPatchError] = useState(false)
  const [patchError, setPatchError] = useState<string[]>([])
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [showAddRoleModal, setShowAddRoleModal] = useState(false)
  const [showAddFeatureModal, setShowAddFeatureModal] = useState(false)
  const [username, setUsername] = useState('')
  const [roleTitle, setRoleTitle] = useState('')
  const [addRoleSuccess, setAddRoleSuccess] = useState(false)
  const [deleteUserSuccess, setDeleteUserSuccess] = useState(false)
  const [addFeatureSuccess, setAddFeatureSuccess] = useState(false)
  const [deleteFeatureSuccess, setDeleteFeatureSuccess] = useState(false)
  const [selectedFeatureObj, setSelectedFeatureObj] = useState<any[]>([])

  const { data: rolesData, refetch: refetchRoleData } = useQuery(
    'admin-role/roles',
    () =>
      axios
        .get('admin-role/roles', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    {
      enabled: !!accessToken,
    }
  )

  const { data: roleUserData, refetch: refetchRoleUser } = useQuery(
    ['admin-role/role-users', roleId],
    () =>
      axios
        .get(`admin-role/role-users?role_id=${roleId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    {
      enabled: !!accessToken && !!roleId,
    }
  )

  const {
    data: roleFeatureData,
    refetch: refetchRoleFeature,
    isLoading: loadingRoleFeatureData,
  } = useQuery(
    ['admin-role/role-features', roleId],
    () =>
      axios
        .get(`admin-role/role-features?role_id=${roleId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    {
      enabled: !!accessToken && !!roleId,
    }
  )

  const { data: searchedUser } = useQuery(
    ['admin-role/users', username],
    () =>
      axios
        .get(`admin-role/users?username=${username}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    {
      enabled: !!accessToken && !!username && username.length > 2,
    }
  )

  const { data: roleFeatures, refetch: refetchFeatures } = useQuery(
    'admin-role/features',
    () =>
      axios
        .get(`admin-role/features`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    {
      enabled: !!accessToken,
    }
  )

  const { mutate: addUserToRole } = useMutation(
    ({ username }: { username: string }) =>
      axios.post(
        `admin-role/role-user?role_id=${roleId}`,
        { username },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      ),
    {
      onSuccess: async (res) => {
        const data = await res.data
        setShowSuccessMsg(true)
        setShowAddUserModal(false)
        refetchRoleUser()
      },
      onError: (error: any) => {
        setHasPatchError(true)
        setPatchError([error.response.data.message])
      },
    }
  )

  const { mutate: addNewRole } = useMutation(
    ({ pool_id, role_name }: { pool_id: number; role_name: string }) =>
      axios.post(
        `admin-role/role`,
        { pool_id, role_name },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      ),
    {
      onSuccess: async (res) => {
        const data = await res.data
        setAddRoleSuccess(true)
        setShowAddRoleModal(false)
        refetchRoleData()
      },
      onError: (error: any) => {
        setHasPatchError(true)
        setPatchError([error.response.data.message])
      },
    }
  )

  const { mutate: deleteRoleUser } = useMutation(
    ({ user_id }: { user_id: string }) =>
      axios.delete(`admin-role/role-user?role_id=${roleId}`, {
        data: { user_id },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }),
    {
      onSuccess: async (res) => {
        const data = await res.data
        refetchRoleUser()
        setDeleteUserSuccess(true)
      },
      onError: (error: any) => {
        setHasPatchError(true)
        setPatchError([error.response.data.message])
      },
    }
  )

  const { mutate: deleteFeature } = useMutation(
    ({ feature_id }: { feature_id: number }) =>
      axios.delete(`admin-role/role-feature?role_id=${roleId}`, {
        data: { feature_id },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }),
    {
      onSuccess: async (res) => {
        const data = await res.data
        refetchRoleFeature()
        setDeleteFeatureSuccess(true)
      },
      onError: (error: any) => {
        setHasPatchError(true)
        setPatchError([error.response.data.message])
      },
    }
  )

  const handleAddFeatures = () => {
    const payload = selectedFeatureObj.map((x) => x.feature_id)

    addFeatures({ payload: payload })
  }

  const { mutate: addFeatures } = useMutation(
    ({ payload }: { payload: number[] }) =>
      axios.put(
        `admin-role/role-features?role_id=${roleId}`,
        { feature_ids: payload },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      ),
    {
      onSuccess: async (res) => {
        const data = await res.data
        setAddFeatureSuccess(true)
        setShowAddFeatureModal(false)
        refetchRoleFeature()
      },
      onError: (error: any) => {
        setHasPatchError(true)
        setPatchError([error.response.data.message])
      },
    }
  )

  useEffect(() => {
    const session: any = sessionData

    if (session?.permissions && !session?.permissions?.includes(16)) {
      router.push('manage/dashboard')
    }
  }, [sessionData, router])

  useEffect(() => {
    setSelectedFeatureObj(
      roleFeatures?.filter((feature: any) =>
        roleFeatureData
          ?.map((item: any) => item.feature_id)
          ?.includes(feature.feature_id)
      ) ?? []
    )
  }, [roleFeatureData, roleFeatures])

  useEffect(() => {
    setRoleList(rolesData?.roles.filter((item: any) => item.pool_id === poolId))
    setRoleId('')
  }, [poolId, rolesData])

  if (status === 'unauthenticated') signIn()

  return (
    <>
      {showSuccessMsg && (
        <div className="max-w-4xl my-4 mx-auto">
          <Alert
            severity="success"
            className="rounded-md"
            onClose={() => setShowSuccessMsg(false)}
          >
            The user has been added to the role successfully!
          </Alert>
        </div>
      )}

      {addRoleSuccess && (
        <div className="max-w-4xl my-4 mx-auto">
          <Alert
            severity="success"
            className="rounded-md"
            onClose={() => setAddRoleSuccess(false)}
          >
            A new role has been added successfully!
          </Alert>
        </div>
      )}

      {deleteUserSuccess && (
        <div className="max-w-4xl my-4 mx-auto">
          <Alert
            severity="success"
            className="rounded-md"
            onClose={() => setDeleteUserSuccess(false)}
          >
            The user got removed from the role successfully!
          </Alert>
        </div>
      )}

      {deleteFeatureSuccess && (
        <div className="max-w-4xl my-4 mx-auto">
          <Alert
            severity="success"
            className="rounded-md"
            onClose={() => setDeleteFeatureSuccess(false)}
          >
            The feature got removed from the role successfully!
          </Alert>
        </div>
      )}

      {addFeatureSuccess && (
        <div className="max-w-4xl my-4 mx-auto">
          <Alert
            severity="success"
            className="rounded-md"
            onClose={() => setAddFeatureSuccess(false)}
          >
            New features have been added to the role successfully!
          </Alert>
        </div>
      )}

      {hasPatchError && (
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={hasPatchError}
          autoHideDuration={3000}
          onClose={() => setHasPatchError(false)}
        >
          <Alert className="capitalize" severity="error" sx={{ width: '100%' }}>
            {patchError.length > 1 ? (
              patchError.map((error: string, index: number) => (
                <p key={index}>{error}</p>
              ))
            ) : (
              <p>{patchError}</p>
            )}
          </Alert>
        </Snackbar>
      )}

      <div className="max-w-6xl mx-auto">
        <Typography className="text-xl mt-8">Pool Administration</Typography>
        <div className="md:flex gap-8 my-8 items-center">
          <div className="flex gap-4 items-center">
            <h2 className="text-[18px] font-semibold mr-4">Select Pool</h2>
            <Box className="w-full md:w-40 mr-8">
              <FormControl fullWidth size="small">
                <Select
                  className="bg-white"
                  labelId="demo-select-small"
                  id="poolId"
                  value={poolId}
                  renderValue={() => {
                    if (!poolId) {
                      return <span>Select Pool</span>
                    }
                    return rolesData?.pools?.find(
                      (item: any) => item.pool_id === poolId
                    )?.pool_name
                  }}
                  displayEmpty
                  onChange={(e) => setPoolId(e.target.value)}
                >
                  {rolesData?.pools?.map((pool: any, index: number) => (
                    <MenuItem key={index} value={pool.pool_id}>
                      {pool.pool_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </div>
          <div className="flex gap-4 items-center">
            <h2 className="text-[18px] font-semibold mr-4">Select Role</h2>
            <Box className="w-full md:w-56 mr-8">
              <FormControl fullWidth size="small">
                <Select
                  className="bg-white"
                  labelId="demo-select-small"
                  id="roleId"
                  value={roleId}
                  renderValue={() => {
                    if (!roleId) {
                      return <span>Select Role</span>
                    }
                    return roleList?.find(
                      (item: any) => item.role_id === roleId
                    )?.role_name
                  }}
                  displayEmpty
                  onChange={(e) => setRoleId(e.target.value)}
                >
                  {roleList?.map((role: any, index: number) => (
                    <MenuItem key={index} value={role.role_id}>
                      {role.role_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </div>
          <Button
            variant="contained"
            className="capitalize px-8"
            onClick={() => setShowAddRoleModal(true)}
          >
            Add New Role
          </Button>
        </div>
        <div className="flex gap-8">
          <div className="w-3/5">
            <div className="flex justify-between items-center">
              <h3>Users with Roles</h3>
              <Button
                variant="contained"
                className="capitalize px-8"
                onClick={() => setShowAddUserModal(true)}
              >
                Add User to Role
              </Button>
            </div>
            <Box sx={{ overflow: 'auto' }}>
              <Box
                sx={{ width: '100%', display: 'table', tableLayout: 'fixed' }}
              >
                <TableContainer component={Paper} className="not-prose">
                  <Table aria-label="simple table">
                    <TableHead className="bg-brand-blue-dark text-white">
                      <TableRow>
                        <TableCell align="center" className=" text-white">
                          Username
                        </TableCell>
                        <TableCell align="center" className=" text-white">
                          Email
                        </TableCell>
                        <TableCell align="center" className="py-0 text-white">
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {roleUserData && roleUserData.length ? (
                        roleUserData.map((roleUser: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell align="center">
                              {roleUser?.username}
                            </TableCell>
                            <TableCell align="center" className="p-1">
                              {roleUser?.email}
                            </TableCell>
                            <TableCell className="p-1">
                              <IconButton
                                aria-label="delete"
                                disabled={false}
                                onClick={() => {
                                  deleteRoleUser({
                                    user_id: roleUser.user_id,
                                  })
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} align="center">
                            No Result Found!
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          </div>
          <div className="w-2/5">
            <div className="flex justify-between items-center">
              <h3>Role Features</h3>
              <Button
                variant="contained"
                className="capitalize px-8"
                onClick={() => setShowAddFeatureModal(true)}
              >
                Add Features
              </Button>
            </div>
            <Box sx={{ overflow: 'auto' }}>
              <Box
                sx={{ width: '100%', display: 'table', tableLayout: 'fixed' }}
              >
                <TableContainer component={Paper} className="not-prose">
                  <Table aria-label="simple table">
                    <TableHead className="bg-brand-blue-dark text-white">
                      <TableRow>
                        <TableCell align="center" className=" text-white">
                          Features
                        </TableCell>
                        <TableCell align="center" className="py-0 text-white">
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loadingRoleFeatureData && (
                        <TableRow>
                          <TableCell colSpan={3}>
                            <Skeleton />
                          </TableCell>
                        </TableRow>
                      )}
                      {roleFeatureData && roleFeatureData.length ? (
                        roleFeatureData.map(
                          (roleFeature: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell align="center" className="p-1">
                                {roleFeature?.feature_desc}
                              </TableCell>
                              <TableCell className="p-1">
                                <IconButton
                                  aria-label="delete"
                                  disabled={
                                    rolesData?.roles?.find(
                                      (item: any) => item.role_id == roleId
                                    ).is_superadmin
                                  }
                                  onClick={() => {
                                    deleteFeature({
                                      feature_id: roleFeature.feature_id,
                                    })
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          )
                        )
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} align="center">
                            No Result Found!
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          </div>
        </div>
      </div>

      {/* Add user to the role modal */}
      <Dialog
        open={showAddUserModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" className="w-[300px]">
          Add User to Role
        </DialogTitle>
        <DialogContent>
          {/* <Autocomplete
            disablePortal
            id="combo-box-demo"
            options={searchedUser ? searchedUser : []}
            sx={{ width: 300 }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Movie"
                onChange={(e) => setUsername(e.target.value)}
              />
            )}
          /> */}
          <TextField
            label="Username"
            fullWidth
            className="bg-white mt-4"
            InputLabelProps={{
              shrink: true,
            }}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <div className="flex justify-end gap-4 mt-4">
            <Button
              variant="outlined"
              onClick={() => setShowAddUserModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => addUserToRole({ username: username })}
            >
              Add
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add new role modal */}
      <Dialog
        open={showAddRoleModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" className="w-[300px]">
          Add New Role
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Role Title"
            fullWidth
            className="bg-white mt-4"
            InputLabelProps={{
              shrink: true,
            }}
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
          />
          <div className="flex justify-end gap-4 mt-4">
            <Button
              variant="outlined"
              onClick={() => setShowAddRoleModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() =>
                addNewRole({ pool_id: Number(poolId), role_name: roleTitle })
              }
            >
              Add
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add features modal */}
      <Dialog
        open={showAddFeatureModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" className="w-[300px]">
          Add Features
        </DialogTitle>
        <DialogContent>
          <Autocomplete
            fullWidth
            // disabled={isLoading}
            multiple
            id="add-features-multi-select"
            className="w-[500px] mt-4"
            value={selectedFeatureObj}
            options={roleFeatures ? roleFeatures : []}
            disableCloseOnSelect
            getOptionLabel={(option: any) => option.feature_desc}
            renderTags={(value) => value.map(() => <></>)}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox
                  icon={icon}
                  checkedIcon={checkedIcon}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {option.feature_desc}
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Select Features"
                placeholder={
                  selectedFeatureObj.length
                    ? `${selectedFeatureObj.length} ${
                        selectedFeatureObj.length > 1 ? 'Features' : 'Feature'
                      } Selected`
                    : 'None'
                }
                InputProps={{ ...params.InputProps, type: 'input' }}
              />
            )}
            onChange={(event, value) => {
              setSelectedFeatureObj(value)
            }}
          />
          <div className="flex justify-end gap-4 mt-4">
            <Button
              variant="outlined"
              onClick={() => setShowAddFeatureModal(false)}
            >
              Cancel
            </Button>
            <Button variant="contained" onClick={handleAddFeatures}>
              Add
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
