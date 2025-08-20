# Cloudinary Setup Guide

## What is Cloudinary?
Cloudinary is a cloud-based service that provides solutions for image and video management. It offers:
- **CDN**: Fast image delivery worldwide
- **Image Optimization**: Automatic compression and format conversion
- **Transformations**: Resize, crop, and modify images on-the-fly
- **Scalability**: Handle unlimited image uploads

## Setup Steps

### 1. Create Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com)
2. Click "Sign Up For Free"
3. Fill in your details and create account

### 2. Get Your Credentials
After signing up, you'll find your credentials in the Dashboard:
- **Cloud Name**: Your unique cloud identifier
- **API Key**: Your API access key
- **API Secret**: Your API secret key

### 3. Update Environment Variables
Add these to your `backend/.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 4. Features Enabled
✅ **Automatic Image Optimization**: Images are compressed and converted to optimal formats
✅ **CDN Delivery**: Images load faster worldwide
✅ **Automatic Resizing**: Large images are resized to 800x800 max
✅ **Cloud Storage**: No local storage needed
✅ **Image Cleanup**: Old images are automatically deleted when products are updated/deleted

### 5. Supported Formats
- JPG/JPEG
- PNG
- GIF
- WebP (automatically converted for better performance)

### 6. File Size Limits
- **Maximum**: 10MB per image
- **Recommended**: 2-5MB for best performance

### 7. Image Transformations
Images are automatically:
- Resized to max 800x800 pixels
- Optimized for quality and file size
- Stored in organized folders

## Benefits Over Local Storage

| Feature | Local Storage | Cloudinary |
|---------|---------------|------------|
| **Performance** | Depends on server | Global CDN |
| **Scalability** | Limited by disk space | Unlimited |
| **Image Optimization** | Manual | Automatic |
| **Backup** | Manual | Automatic |
| **Cost** | Server storage | Free tier available |
| **Maintenance** | Manual cleanup | Automatic |

## Free Tier Limits
- **Storage**: 25GB
- **Bandwidth**: 25GB/month
- **Transformations**: 25,000/month
- **Perfect for development and small projects!**

## Security
- All uploads are authenticated
- Images are stored in private folders
- Access controlled via API keys
- Automatic cleanup prevents orphaned files

## Need Help?
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [API Reference](https://cloudinary.com/documentation/admin_api)
- [Free Support](https://cloudinary.com/support)
