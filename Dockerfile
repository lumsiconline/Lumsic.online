FROM node:22-slim

WORKDIR /app

# Install dependencies (tsx is currently a devDependency and is required by npm start).
COPY package*.json ./
RUN npm install --include=dev

# Build the Vite frontend and include the Express backend.
COPY . .
RUN npm run build \
 && mkdir -p data public/uploads \
 && chown -R node:node /app

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

USER node
CMD ["npm", "start"]
