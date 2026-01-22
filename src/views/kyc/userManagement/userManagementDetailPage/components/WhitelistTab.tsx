// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import CopyButton from '@/components/options/CopyButton'
import { useTranslate } from '@/contexts/DictionaryContext'

// Icon Imports
import { Wallet, ExternalLink, Copy } from 'lucide-react'
import { formatDate } from 'date-fns/format'

interface WhitelistTabProps {
  info: any
}

const WhitelistTab = ({ info }: WhitelistTabProps) => {
  const t = useTranslate()
  return (
    <Grid container spacing={6}>
      {/* 已审核通过的法币账户 */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <div className='flex items-center gap-2 mbe-6'>
              <Wallet size={20} className='text-primary' />
              <Typography variant='h6' className='font-semibold'>
                {t('userManagement.approvedFiatAccounts')} {/* 已审核通过的法币账户 */}
              </Typography>
            </div>
            {info?.bankAccountList?.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('userManagement.accountType')}</TableCell> {/* 账户类型 */}
                      <TableCell>{t('userManagement.bankPlatform')}</TableCell> {/* 银行/平台 */}
                      <TableCell>{t('userManagement.accountNumber')}</TableCell> {/* 账号 */}
                      <TableCell>{t('userManagement.accountHolder')}</TableCell> {/* 持有人 */}
                      <TableCell>{t('userManagement.status')}</TableCell> {/* 状态 */}
                      <TableCell>{t('userManagement.approvalTime')}</TableCell> {/* 审核通过时间 */}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {info?.bankAccountList?.map((account: any) => (
                      <TableRow key={account.id}>
                        <TableCell>{t('userManagement.bankCard')}</TableCell> {/* 银行卡 */}
                        <TableCell>{account.bankName}</TableCell>
                        <TableCell className='font-mono'>{account.bankAccount}</TableCell>
                        <TableCell>{account.memberNickName}</TableCell>
                        <TableCell>
                          <Chip label={account.statusLabel} color='success' size='small' />
                        </TableCell>
                        <TableCell className='text-textSecondary text-sm'>
                          {account.reviewTime ? formatDate(account.reviewTime, 'yyyy-MM-dd hh:mm') : ''}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <div className='text-center py-8 text-textSecondary'>
                <Typography>{t('userManagement.noApprovedFiatAccounts')}</Typography> {/* 暂无已审核通过的法币账户 */}
              </div>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* 已审核通过的数字资产地址 */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <div className='flex items-center gap-2 mbe-6'>
              <ExternalLink size={20} className='text-primary' />
              <Typography variant='h6' className='font-semibold'>
                {t('userManagement.approvedDigitalAssetAddresses')} {/* 已审核通过的数字资产地址 */}
              </Typography>
            </div>
            {info?.walletWhiteList?.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('userManagement.network')}</TableCell> {/* 网络 */}
                      <TableCell>{t('userManagement.address')}</TableCell> {/* 地址 */}
                      <TableCell>{t('userManagement.label')}</TableCell> {/* 标签 */}
                      <TableCell>{t('userManagement.status')}</TableCell> {/* 状态 */}
                      <TableCell>{t('userManagement.approvalTime')}</TableCell> {/* 审核通过时间 */}
                      <TableCell>{t('userManagement.action')}</TableCell> {/* 操作 */}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {info?.walletWhiteList?.map((address: any) => (
                      <TableRow key={address.id}>
                        <TableCell>
                          <Chip label={address.coinKey} size='small' variant='outlined' />
                        </TableCell>
                        <TableCell className='font-mono text-sm'>{address.walletAddress}</TableCell>
                        <TableCell>{address.remark}</TableCell>
                        <TableCell>
                          <Chip label={address.statusLabel} color='success' size='small' />
                        </TableCell>
                        <TableCell className='text-textSecondary text-sm'>
                          {address.updatedAt ? formatDate(address.updatedAt, 'yyyy-MM-dd hh:mm') : ''}
                        </TableCell>
                        <TableCell>
                          <CopyButton text={address.walletAddress} size='small' sx={{ p: 0.5 }} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <div className='text-center py-8 text-textSecondary'>
                <Typography>{t('userManagement.noApprovedDigitalAssetAddresses')}</Typography> {/* 暂无已审核通过的数字资产地址 */}
              </div>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default WhitelistTab
