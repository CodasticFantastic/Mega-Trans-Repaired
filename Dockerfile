# RUN npx prisma migrate deploy
# RUN npx prisma generate
# RUN npm run build
# RUN mkdir -p /app/.next/cache/images
# # Production image, copy all the files and run next
# FROM node:16-alpine AS runner
# WORKDIR /app
# ENV NODE_ENV production
# ENV NEXT_TELEMETRY_DISABLED 1
# RUN addgroup --system --gid 1001 nodejs
# RUN adduser --system --uid 1001 nextjs
# COPY --chown=nextjs:nodejs --from=builder /app/ ./
# USER nextjs
# ENV PORT 3000
# CMD ["npm", "run","start"]


















#Initializing Command    
# docker build -t nextjs-megatrans-cms-system .

#Docker run command   
# docker run -dp 3000:3000 nextjs-megatrans-cms-system




FROM node:18-alpine

WORKDIR /usr/src/app


COPY . .

RUN npm install
RUN npm run build

CMD ["npm", "run", "dev"]

