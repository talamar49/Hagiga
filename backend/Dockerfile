FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
# Install full dependencies (including devDependencies) so TypeScript can build inside the image
RUN npm install
COPY . .
RUN npm run build
CMD ["node", "dist/index.js"]
