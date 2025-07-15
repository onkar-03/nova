# You can use most Debian-based base images
# Set the Environment Node
FROM node:21-slim

# Install curl
RUN apt-get update && apt-get install -y curl && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy in a custom script (e.g., to compile a page at runtime or build time)
COPY compile_page.sh /compile_page.sh

# Make the script executable
RUN chmod +x /compile_page.sh

# Install dependencies and customize sandbox
# Set working directory where the Next.js app will be initially created
WORKDIR /home/user/nextjs-app

RUN npx --yes create-next-app@15.35 . --yes

RUN npx --yes shadcn@2.6.3 init --yes -b neutral --force
RUN npx --yes shadcn@2.6.3 add --all --yes

# Move the Nextjs app to the home directory and remove the nextjs-app directory
RUN mv /home/user/nextjs-app/* /home/user/ && rm -rf /home/user/nextjs-app

