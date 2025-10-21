FROM node:20-bullseye-slim
WORKDIR /app

# Install build tools so native modules (bcrypt, etc.) can be built reliably
RUN apt-get update && apt-get install -y --no-install-recommends \
		build-essential python3 make g++ \
	&& rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
# Install full dependencies (including devDependencies) so TypeScript can build inside the image
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build
CMD ["node", "dist/index.js"]
