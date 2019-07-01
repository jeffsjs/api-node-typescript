export const environment = {
  server: { port: process.env.SERVER_PORT || 3002 },
  db: { url: process.env.DB_URL || 'mongodb://localhost/meat-api'},
  secutiry: { saltRounds: process.env.SALT_ROUNDS || 10 }
}
