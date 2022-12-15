# bandage castle

monster care app for the castle. boarding, treatment, therapy, surrenders.

## setup

you need node 16 and mysql.

```
# server
cd server
npm install
# make a .env with DATABASE_URL=mysql://user:pass@localhost:3306/bandage
npm run db:init
npm run create-user -- you@castle.com somepassword ADMIN
npm run dev

# client (other terminal)
cd client
npm install
npm run dev
```

open http://localhost:5173

## notes

- roles: ADMIN, STAFF, OWNER
- money is in gold pieces (gp)
- ravens get "sent" every 15s (they just get logged)
- arena is on hold, dont touch
