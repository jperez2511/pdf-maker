
FROM node:8.2
LABEL Name=pdf-maker Version=0.1.0
RUN npm install --global typescript
RUN npm install --global ts-node
RUN mkdir app
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 3000
CMD [ "npm", "start" ]
