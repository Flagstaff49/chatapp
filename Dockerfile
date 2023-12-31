# Use the official Node.js image as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package.json package-lock.json ./

# Install the dependencies
RUN yarn install

# Copy the source code to the container
COPY . .

# Expose port
EXPOSE 3000

# Start the server when the container starts
CMD ["yarn", "prod"]
