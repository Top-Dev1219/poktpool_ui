import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useQuery } from 'react-query'
import {
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material'
import CircleNotificationsIcon from '@mui/icons-material/CircleNotifications'
import { isYesterday, isToday, format } from 'date-fns'
import parse from 'html-react-parser'
import useApi from '../hooks/useApi'
import useUser from '../hooks/useUser'
import { formatUTCDate } from '../src/utils/time'

export default function UserNotificationMenu({
  isOnAdmin,
}: {
  isOnAdmin?: boolean
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  // const [hasNewNotification, setHasNewNotification] = useState(true)
  const router = useRouter()
  const { user } = useUser()

  const {
    isLoading,
    error,
    data: allPosts,
    refetch: refetchPosts,
  } = useQuery(
    'wp/poktpool-all-blog-posts',
    () =>
      fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_BASE_URL}/wp-json/wp/v2/posts?_embed&per_page=100`
      ).then((res) => res.json()),
    { enabled: true }
  )

  const open = Boolean(anchorEl)

  const notificationData = useMemo(() => {
    const notificationIds = notifications.map((item: any) => item.id)
    return allPosts
      ? allPosts.map((item: any) => ({
          ...item,
          hasNotification: !notificationIds.includes(item.id),
        }))
      : []
  }, [allPosts, notifications])

  const todayPosts = useMemo(() => {
    return (
      notificationData &&
      notificationData.filter((post: any) => isToday(new Date(post.date)))
    )
  }, [notificationData])

  const yesterdayPosts = useMemo(() => {
    return (
      notificationData &&
      notificationData.filter((post: any) => isYesterday(new Date(post.date)))
    )
  }, [notificationData])

  const olderPosts = useMemo(() => {
    return (
      notificationData &&
      notificationData.filter(
        (post: any) =>
          !isToday(new Date(post.date)) && !isYesterday(new Date(post.date))
      )
    )
  }, [notificationData])

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = (data?: any) => {
    if (data) {
      const notification = notifications.find(
        (item: any) => item.id === data.id
      )
      if (!notification) {
        const posts = [data, ...notifications]
        console.log('posts', posts)
        window.sessionStorage.setItem('notifications', JSON.stringify(posts))
        setNotifications(posts)
      }
    }

    setAnchorEl(null)
  }

  useEffect(() => {
    const notificationString = sessionStorage.getItem('notifications')

    if (notificationString) {
      setNotifications(JSON.parse(notificationString))
    }
  }, [])

  useEffect(() => {
    refetchPosts()
  }, [router.pathname, refetchPosts])

  const markAsRead = () => {
    console.log('posts', allPosts)
    sessionStorage.setItem('notifications', JSON.stringify(allPosts))
    setNotifications(allPosts)
  }

  const hasNewNotification = useMemo(() => {
    return (
      notificationData?.find((item: any) => item.hasNotification) !== undefined
    )
  }, [notificationData])

  return (
    <>
      <Tooltip title="Notification Center">
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{ ml: 2, position: 'relative' }}
          className="ml-[62px] md:ml-2"
          aria-controls={open ? 'account-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <CircleNotificationsIcon
            sx={{ width: 38, height: 38, fill: '#b7b7b7' }}
          />
          {hasNewNotification ? (
            <div className="w-3 h-3 rounded-full bg-brand-blue-dark absolute border border-white border-solid top-1.5 right-1.5"></div>
          ) : (
            <></>
          )}
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={() => handleClose()}
        className="max-w-[384px] md:max-w-[440px]"
        PaperProps={{
          elevation: 0,
          sx: {
            width: '100%',
            overflowY: 'auto',
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <div className="border-b border-0 border-solid border-slate-300 pt-2 pb-3 px-3">
          <div className="flex justify-between w-full items-center">
            <h3 className="my-0">Notifications</h3>
            <p
              className="my-0 text-sm cursor-pointer hover:text-brand-blue-dark hover:underline"
              onClick={markAsRead}
            >
              Mark all as read
            </p>
          </div>
        </div>
        <div className="px-4 notification-menu-content overflow-y-auto">
          {todayPosts && todayPosts?.length ? (
            <p className="font-bold text-base uppercase">TODAY</p>
          ) : (
            ''
          )}
          {todayPosts && todayPosts?.length
            ? todayPosts.map((todayPost: any) => (
                <div
                  key={todayPost.id}
                  className={`notification-menu-item p-3 mt-4 rounded-md border border-solid  hover:cursor-pointer hover:border-brand-blue-dark ${
                    todayPost.hasNotification
                      ? 'bg-slate-100 border-transparent'
                      : 'bg-transparent border-slate-200'
                  }`}
                  onClick={() => handleClose(todayPost)}
                >
                  <Link href={'/blogs/' + todayPost?.slug} passHref>
                    <div>
                      <div className="flex justify-between items-center">
                        <p className="my-0 font-semibold text-sm">
                          Admin has published a new blog.
                        </p>
                        <p className="my-0 text-xs">Today</p>
                      </div>
                      <p className="text-brand-blue-dark my-1">
                        {todayPost?.title?.rendered}
                      </p>
                      <p className="my-0 text-sm notification-ellipsis-text">
                        {todayPost?.excerpt?.rendered &&
                          parse(todayPost?.excerpt?.rendered)}
                      </p>
                    </div>
                  </Link>
                </div>
              ))
            : ''}
          {yesterdayPosts && yesterdayPosts?.length ? (
            <p className="font-bold text-base uppercase">Yesterday</p>
          ) : (
            ''
          )}
          {yesterdayPosts && yesterdayPosts?.length
            ? yesterdayPosts.map((yesterdayPost: any) => (
                <div
                  key={yesterdayPost.id}
                  className={`notification-menu-item p-3 mt-4 rounded-md border border-solid hover:cursor-pointer hover:border-brand-blue-dark ${
                    yesterdayPost.hasNotification
                      ? 'bg-slate-100 border-transparent'
                      : 'bg-transparent border-slate-200'
                  }`}
                  onClick={() => handleClose(yesterdayPost)}
                >
                  <Link href={'/blogs/' + yesterdayPost?.slug} passHref>
                    <div>
                      <div className="flex justify-between items-center">
                        <p className="my-0 font-semibold text-sm">
                          Admin has published a new blog.
                        </p>
                        <p className="my-0 text-xs">1 day ago</p>
                      </div>
                      <p className="my-0 text-brand-blue-dark mt-1">
                        {yesterdayPost?.title?.rendered}
                      </p>
                      <p className="my-0 text-sm notification-ellipsis-text">
                        {yesterdayPost?.excerpt?.rendered &&
                          parse(yesterdayPost?.excerpt?.rendered)}
                      </p>
                    </div>
                  </Link>
                </div>
              ))
            : ''}

          {olderPosts && olderPosts?.length ? (
            <p className="font-bold text-base uppercase">Older</p>
          ) : (
            ''
          )}
          {olderPosts && olderPosts?.length
            ? olderPosts.map((olderPost: any) => (
                <div
                  key={olderPost.id}
                  className={`notification-menu-item p-3 mt-4  rounded-md border border-solid  hover:cursor-pointer hover:border-brand-blue-dark ${
                    olderPost.hasNotification
                      ? 'bg-slate-100 border-transparent'
                      : 'bg-transparent border-slate-200'
                  }`}
                  onClick={() => handleClose(olderPost)}
                >
                  <Link href={'/blogs/' + olderPost?.slug} passHref>
                    <div>
                      <div className="flex justify-between items-center">
                        <p className="my-0 font-semibold text-sm">
                          Admin has published a new blog.
                        </p>
                        <p className="my-0 text-xs text-right">
                          {olderPost?.date &&
                            format(
                              formatUTCDate(olderPost?.date),
                              'yyyy-MM-dd'
                            )}
                        </p>
                      </div>
                      <p className="my-0 text-brand-blue-dark mt-1">
                        {olderPost?.title?.rendered}
                      </p>
                      <p className="my-0 text-sm notification-ellipsis-text">
                        {olderPost?.excerpt?.rendered &&
                          parse(olderPost?.excerpt?.rendered)}
                      </p>
                    </div>
                  </Link>
                </div>
              ))
            : ''}
        </div>
      </Menu>
    </>
  )
}
