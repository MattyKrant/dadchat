# ClaimAppeal AI

A SaaS application that helps users generate professional health insurance appeal letters from denied claims using AI-powered OCR and GPT-based letter generation.

## Features

- **User Authentication**: Secure email/password authentication via Supabase
- **File Upload**: Support for PDF and image uploads (JPG, PNG) up to 10MB
- **OCR Processing**: Extract key information from claim documents using Tesseract.js
- **AI Letter Generation**: Generate professional appeal letters using OpenAI GPT-4
- **Export Options**: Copy to clipboard or download as PDF
- **Responsive Design**: Modern UI built with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **OCR**: Tesseract.js
- **AI**: OpenAI GPT-4 API
- **PDF Generation**: jsPDF
- **Hosting**: Vercel (recommended)

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- OpenAI API key

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd claim-appeal-ai
npm install
```

### 2. Environment Variables

Copy `.env.local` and fill in your credentials:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Mindee API (Optional - if using instead of Tesseract)
MINDEE_API_KEY=your_mindee_api_key_here

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### 3. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your URL and keys
3. Run the SQL commands from `supabase-schema.sql` in the Supabase SQL editor:
   - Creates the `claims` table
   - Sets up Row Level Security
   - Creates storage bucket for claim documents
   - Sets up storage policies

### 4. OpenAI Setup

1. Get your API key from [OpenAI](https://platform.openai.com/api-keys)
2. Add it to your `.env.local` file
3. Ensure you have credits in your OpenAI account

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

1. **Sign Up/Sign In**: Create an account or sign in with existing credentials
2. **Upload Document**: Drag and drop or click to upload your denied claim document (image format recommended)
3. **Review Extracted Data**: The OCR will automatically extract key information from your document
4. **Generate Appeal**: Click "Generate Appeal Letter" to create a professional appeal letter
5. **Export**: Copy the letter to clipboard or download as PDF

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── generate-appeal/    # OpenAI letter generation
│   │   ├── generate-pdf/       # PDF generation
│   │   └── ocr/               # OCR processing
│   ├── dashboard/             # Main dashboard page
│   ├── signin/               # Sign in page
│   ├── signup/               # Sign up page
│   └── page.tsx              # Landing page
├── components/
│   ├── auth/
│   │   └── AuthForm.tsx      # Authentication form
│   └── FileUpload.tsx        # File upload component
└── lib/
    └── supabase.ts           # Supabase client configuration
```

## API Endpoints

- `POST /api/ocr` - Process uploaded documents with OCR
- `POST /api/generate-appeal` - Generate appeal letters using OpenAI
- `POST /api/generate-pdf` - Convert text to PDF

## Database Schema

The application uses a single `claims` table with the following structure:

- `id` - UUID primary key
- `user_id` - Reference to authenticated user
- `file_name` - Original filename
- `file_url` - Supabase storage URL
- `file_type` - MIME type
- `ocr_data` - Extracted information (JSONB)
- `appeal_letter` - Generated letter text
- `status` - Processing status
- `created_at` / `updated_at` - Timestamps

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to set all environment variables in your production environment, updating URLs as needed:

- Update `NEXTAUTH_URL` to your production domain
- Ensure Supabase URLs and keys are correct
- Verify OpenAI API key is valid

## Limitations & Future Improvements

### Current Limitations

- PDF processing not yet implemented (images only)
- Basic OCR text extraction (may need manual review)
- Simple regex-based data extraction

### Potential Improvements

- PDF processing with pdf-parse or PDF.js
- More sophisticated OCR with Mindee API
- Machine learning for better data extraction
- Template-based letter generation
- User history and claim management
- Email integration for direct submission
- Multi-language support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the GitHub issues
2. Review the setup instructions
3. Verify environment variables are correct
4. Check Supabase and OpenAI API status
