FROM node:23-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set up PNPM_HOME for global installations
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME/bin:$PATH

# Create the PNPM_HOME directory manually
RUN mkdir -p $PNPM_HOME && corepack enable

# Set node environment to production
ENV NODE_ENV=production

# Copy only the necessary files for dependency installation
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install production dependencies
RUN pnpm install --frozen-lockfile --prod

# Install nx globally
RUN pnpm config set global-bin-dir $PNPM_HOME/bin && pnpm add -g nx

# Copy the rest of the application files
COPY nx.json ./nx.json
COPY tsconfig.base.json ./tsconfig.base.json
COPY workspace.json ./workspace.json
COPY apps/yolo.dev/ ./apps/yolo.dev

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=4200
ENV HOSTNAME="0.0.0.0"

# Expose the desired port
EXPOSE 4200

# Default command to run the app
CMD ["pnpm", "exec", "nx", "serve", "yolo.dev", "--configuration=production"]