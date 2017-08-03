
FROM node:8.2
LABEL Name=pdf-maker Version=0.1.0
RUN npm install --global typescript
RUN mkdir app
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
EXPOSE 3000
CMD [ "npm", "start" ]
