# Place du Village WhatsApp Automation

This project automates daily WhatsApp group messages using AWS Lambda, OpenAI, and S3. It is designed for deployment with AWS SAM and supports local development and testing.

## Features
- **generateMessages Lambda**: Uses OpenAI to generate a list of daily messages and stores them in S3 (each as an empty object with the message in metadata).
- **sendDaily Lambda**: Reads the next message from S3 metadata, sends it to a WhatsApp group, and archives the object.
- **WhatsApp session/auth**: Auth and cache are stored in S3 under the `whatsapp/` directory for Lambda compatibility.
- **AWS SAM**: Infrastructure as code for easy deployment and scheduling.
- **Local development**: Run and test Lambdas locally with TypeScript.

## Requirements
- Node.js 18+
- AWS account with permissions for Lambda and S3
- OpenAI API key
- WhatsApp group admin access

## Setup
1. **Install dependencies**
   ```cmd
   npm install
   ```
2. **Environment variables**
   Create a `.env` file or set these variables:
   - `OPENAI_API_KEY` (for OpenAI)
   - `BUCKET_NAME` or `S3_BUCKET_MESSAGES` (for S3 bucket)
   - `WHATSAPP_GROUP_ID` (for WhatsApp group)
   - `AWS_REGION` (e.g. `eu-west-1`)

## Local Usage
Run Lambdas locally with TypeScript:
```cmd
npm run local:generate   # Generate and upload messages to S3
npm run local:send       # Send the next message to WhatsApp and archive it
```

## Deployment (AWS SAM)
1. **Build and deploy with SAM**
   ```cmd
   sam build
   sam deploy --guided
   ```
2. **Automated deployment**
   - GitHub Actions workflow `.github/workflows/deploy-sam.yml` will deploy on push to `main`.

## Project Structure
- `src/lambdas/` - Lambda function handlers
- `src/utils/`   - Utility modules (OpenAI, S3, WhatsApp)
- `src/local.ts` - Local entry point for testing
- `template.yaml` - AWS SAM template
- `infrastructure/` - (Optional) Terraform files

## Notes
- WhatsApp session data is stored in S3 for Lambda compatibility. Ensure sync if running locally.
- Messages are stored as S3 objects with content in the `x-amz-meta-message` metadata.
- All code is TypeScript-first.

## License
MIT
