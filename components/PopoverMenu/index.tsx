import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  Box,
  Typography,
  Button,
  Menu,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material'

export interface MenuItemModel {
  title: string
  icon?: JSX.Element
  href?: string
  children?: MenuItemModel[]
  isOpened?: boolean
  anchorEl?: any | null
  badge?: JSX.Element
  disabled?: boolean
}

export default function PopoverMenu({
  menuItems,
}: {
  menuItems?: MenuItemModel[]
}) {
  const [state, setState] = useState({
    menus: [] as MenuItemModel[],
    latestMenus: [] as MenuItemModel[] | undefined,
    isOpened: false,
    anchorEl: null as any,
  })

  const router = useRouter()

  const handleLatestMenusToggle = () => {
    setState((state) => ({ ...state, isOpened: false, anchorEl: null }))
  }

  const handleLatestMenuAction = useCallback(
    (item: MenuItemModel) => {
      setState((state) => ({
        ...state,
        isOpened: false,
        anchorEl: null,
        menus: state.menus.map((x) => ({
          ...x,
          isOpened: false,
          anchorEl: null,
        })),
      }))
      if (item.href) {
        router.push(item.href)
      }
    },
    [menuItems]
  )

  const handleMenuItemToggle = (
    item: MenuItemModel,
    index: number,
    event?: React.MouseEvent<HTMLDivElement>
  ) => {
    const menus = [...state.menus]
    menus.splice(index, 1, {
      ...item,
      isOpened: !item.isOpened,
      anchorEl: event?.currentTarget,
    })
    setState((state) => ({ ...state, menus, isOpened: false, anchorEl: null }))
  }

  const renderChildMenuItems = (
    item: MenuItemModel,
    index: number,
    key: string
  ) => {
    const action = (
      child: MenuItemModel,
      event?:
        | React.MouseEvent<HTMLButtonElement>
        | React.MouseEvent<HTMLDivElement>
    ) => {
      if (child.children && child.children.length > 0) {
        setState((state) => ({
          ...state,
          isOpened: true,
          anchorEl: event && event.currentTarget ? event.currentTarget : null,
          latestMenus: child.children,
        }))
      } else {
        item.isOpened = !item.isOpened
        item.anchorEl =
          event && event.currentTarget ? event.currentTarget : null
        setState((state) => ({ ...state }))
        if (child.href) {
          router.push(child.href)
        }
      }
    }

    return (
      <>
        <Menu
          key={key}
          anchorEl={item.anchorEl}
          id={`header-nav-menu-toggle-${key}`}
          open={item.isOpened || false}
          onClose={() => handleMenuItemToggle(item, index)}
          className="py-0"
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              borderRadius: '6px',
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 30,
                width: 15,
                height: 15,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <List component="nav" className="min-w-[200px]">
            {item.children &&
              item.children.map((child, index) => {
                return (
                  <>
                    <ListItem
                      id={`header-navbar-${child.title}`}
                      button
                      className="py-0"
                      key={`header-navbar-${child.title}-${index}`}
                      disabled={child.disabled}
                      onClick={(e) =>
                        child.children && child.children.length > 0
                          ? action(child, e)
                          : action(child)
                      }
                    >
                      <ListItemIcon className="min-h-[45px]">
                        {child?.icon}
                      </ListItemIcon>
                      <ListItemText>
                        <Box position="relative" className="text-base">
                          {child.title}
                        </Box>
                      </ListItemText>
                    </ListItem>
                    {item.children?.length !== index + 1 && (
                      <Divider className="mx-5" />
                    )}
                  </>
                )
              })}
          </List>
        </Menu>
      </>
    )
  }

  const renderMenuItems = () => {
    const menuItems: JSX.Element[] = []

    state.menus.forEach((item, index) => {
      const hasChildren = item.children && item.children?.length > 0

      const listItem = hasChildren ? (
        <Box
          id={`header-nav-button-${index}`}
          key={`header-nav-button-${index}`}
          aria-describedby={`header-nav-button=${index}`}
          onClick={(event) => handleMenuItemToggle(item, index, event)}
          className="mx-4 py-4 cursor-pointer hover:bg-transparent focus:bg-transparent"
        >
          <Box
            display={'flex'}
            position={'relative'}
            className="text-base capitalize"
          >
            {item.title}
          </Box>
        </Box>
      ) : (
        <div
          className="cursor-pointer mx-4 py-5 text-base"
          key={`header-nav-button-${index}`}
        >
          {item.href ? (
            <Link passHref href={item.href}>
              {item.title}
            </Link>
          ) : (
            <Typography>{item.title}</Typography>
          )}
        </div>
      )

      menuItems.push(listItem)

      if (hasChildren)
        menuItems.push(renderChildMenuItems(item, index, `${index}-children`))
    })

    return menuItems
  }

  useEffect(() => {
    setState((state) => ({
      ...state,
      menus: menuItems ?? [],
    }))
  }, [menuItems])

  return (
    <>
      {renderMenuItems()}
      <Menu
        anchorEl={state.anchorEl}
        id={`header-nav-menu-toggle-latest-nav`}
        open={state.isOpened || false}
        onClose={handleLatestMenusToggle}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 3,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 20,
              right: 0,
              marginRight: -0.7,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <List component="nav" className="min-w-[200px] py-0">
          {state.latestMenus &&
            state.latestMenus.length &&
            state.latestMenus.map((child, index) => {
              return (
                <>
                  <ListItem
                    id={`header-navbar-${child.title}`}
                    button
                    key={`header-navbar-${child.title}-${index}`}
                    disabled={child.disabled}
                    onClick={() => handleLatestMenuAction(child)}
                  >
                    <ListItemIcon className="min-w-[45px]">
                      {child?.icon}
                    </ListItemIcon>
                    <ListItemText>
                      <Box position="relative" className="text-base">
                        {child.title}
                      </Box>
                    </ListItemText>
                  </ListItem>
                  {state.latestMenus?.length !== index + 1 && (
                    <Divider className="mx-5" />
                  )}
                </>
              )
            })}
        </List>
      </Menu>
    </>
  )
}
