FROM node:9

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install --only=production
RUN npm -g i knex-migrate
RUN npm -g i jasmine

# Bundle app source
COPY . .

EXPOSE 3000
CMD ["npm", "start"]
