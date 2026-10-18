# NECRT

A demo booking desk for casual relief teachers in North East Victoria.

Schools push out a day, a half day, or a block of days. CRTs who have chosen that school can take it. The school confirms. Login is left off so a campus can try both sides in one browser.

Sample campuses:

- Appin Park Primary School, Wangaratta
- Cathedral College, Wangaratta
- Milawa Primary School, Milawa

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:41731](http://localhost:41731) if you start it with the port below, or the port Next prints.

```bash
npx next dev --hostname 0.0.0.0 --port 41731
```

## What to click

School desk starts at Appin Park PS. Friday morning already has Tom Heslop waiting. Confirm him, or request a new day from the calendar.

CRT desk starts as Priya Raman. Switch the person in the header to Elise Moretti to see a confirmed Prep day at Milawa, or Daniel Okonkwo to see the Cathedral sport block.

Everything is saved in this browser. **Reset demo** puts the sample days back.

## Deploy

This is a Next.js app. Connect the repository in Vercel and set the production domain to `necrt.vercel.app` from the Vercel project settings. No environment variables are required for the demo.
