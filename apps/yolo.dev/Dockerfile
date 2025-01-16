FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy pre-built application
COPY dist/apps/yolo.dev/public ./public
COPY dist/apps/yolo.dev/.next/standalone ./
COPY dist/apps/yolo.dev/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
