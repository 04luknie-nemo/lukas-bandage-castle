export const config = {
  port: Number(process.env.PORT) || 3001,
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
  sessionCookie: 'bc_session',
  sessionDays: 7,
  webUrl: process.env.WEB_URL || 'http://localhost:5173',
  isProduction: process.env.NODE_ENV === 'production',
}
