import {
  Typography,
  Box,
  Alert,
  TextField,
  FormControl,
  Select,
  Button,
  MenuItem,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Stack,
  AlertTitle,
} from '@mui/material'

export const MemberDetailTable = ({
  headers,
  contentData,
}: {
  headers: any
  contentData?: any
}) => {
  return (
    <Box sx={{ overflow: 'auto' }}>
      <Box sx={{ width: '100%', display: 'table', tableLayout: 'fixed' }}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead className="bg-brand-blue-dark">
              <TableRow>
                {headers.map((header: any, index: number) => (
                  <TableCell
                    key={index}
                    align="center"
                    className="text-white hover:text-white max-w-[100px]"
                  >
                    {header.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {contentData.length ? (
                contentData.map((mb: any, index: number) => (
                  <TableRow
                    key={index}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                    }}
                  >
                    {headers.map((h: any, index: number) => (
                      <TableCell
                        key={index}
                        align="center"
                        style={{ width: 100 }}
                      >
                        {mb[h.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={headers?.length}>
                    <p className="text-center my-0">No data found!</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  )
}
