# Create documents directory
mkdir documents

# Create QR-codes of documents
mkdir documents-qr

# ImageMagick required for crop qr-code
sudo apt install imagemagick

# Create db directory
mkfir db

# # Create symlink for .env (need for prisma)
# ln -sf .env.dev .env

# # Run migrations
# npx prisma migrate dev --name init
