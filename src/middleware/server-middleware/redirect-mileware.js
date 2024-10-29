const allowedLocations = [
  '/',
  '/login',
  '/logout',
  '/careers',
  '/blogs',
  '/dashboard',
  '/manage/stake',
  '/manage/sweeps',
  '/manage/unstake',
  '/manage/transfer',
  '/account/profile',
  '/account/verification',
  '/account/twoFactor',
  '/account/wallets',
  '/admin/',
]

function isAllowedLocation(url) {
  return allowedLocations.includes(url)
}

function redirectMiddleware(req, res, next) {
  const url = req.url

  if (!isAllowedLocation(url)) {
    res.statusCode = 403
    res.end('Forbidden')
  } else {
    next()
  }
}

module.exports = redirectMiddleware
