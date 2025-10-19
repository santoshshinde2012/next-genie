# Databricks Genie Next.js Application

A modern, production-ready Next.js application for interacting with Databricks Genie using natural language queries. Built with TypeScript, Tailwind CSS v4, and following React best practices.

## 🚀 Features

- **Natural Language Queries**: Ask questions about your data using plain English
- **Real-time Chat Interface**: Interactive conversation with Databricks Genie
- **Query Execution**: Execute and display SQL query results
- **Conversation History**: Browse and resume previous conversations
- **Message Feedback**: Rate and comment on AI responses
- **Suggested Questions**: Get AI-powered follow-up question suggestions
- **Mobile Responsive**: Works perfectly on all device sizes
- **Dark Mode Ready**: Full dark mode support (coming soon)
- **Modern UI**: Beautiful, accessible interface with smooth animations

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **State Management**: React Context API

### Project Structure
```
├── app/                          # Next.js app router
│   ├── api/genie/               # API routes
│   ├── globals.css              # Global styles (Tailwind v4)
│   └── page.tsx                 # Main page
├── components/                   # Legacy components
│   ├── ui/                      # UI components
│   └── Chat*.tsx                # Chat components
├── src/                         # Modern source structure
│   ├── components/
│   │   ├── layout/              # Layout components
│   │   └── pages/               # Page components
│   ├── contexts/                # React contexts
│   ├── hooks/                   # Custom hooks
│   └── types/                   # TypeScript types
│       ├── api/                 # API types
│       ├── domain/              # Domain types
│       ├── ui/                  # UI types
│       └── config/              # Config types
└── lib/                         # Utilities and helpers
    ├── config/                  # Configuration
    ├── hooks/                   # Legacy hooks
    ├── services/                # API services
    └── utils/                   # Utilities
```

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Databricks workspace with Genie enabled

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd genie-next
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env.local` file in the root directory:

```env
DATABRICKS_HOST=https://your-workspace.databricks.com
DATABRICKS_TOKEN=your-personal-access-token
DATABRICKS_SPACE_ID=your-genie-space-id
```

To get these values:
- `DATABRICKS_HOST`: Your Databricks workspace URL
- `DATABRICKS_TOKEN`: Generate a personal access token in Databricks
- `DATABRICKS_SPACE_ID`: Your Genie space ID (found in the Genie UI URL)

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
```
http://localhost:3000
```

## 🎨 Tailwind CSS v4

This project uses Tailwind CSS v4 with the new `@import` and `@theme` syntax.

### Key Features
- ✅ No config files needed
- ✅ All configuration in CSS
- ✅ Faster build times
- ✅ Better performance
- ✅ Modern CSS features

### Theme Customization

Edit `app/globals.css` to customize the theme:

```css
@theme {
  /* Custom colors */
  --color-primary-500: #3b82f6;
  --color-databricks-500: #0ea5e9;
  
  /* Custom fonts */
  --font-sans: 'Inter', system-ui, sans-serif;
  
  /* Custom shadows */
  --shadow-soft: 0 2px 15px -3px rgba(0, 0, 0, 0.07);
}
```

See [TAILWIND_V4_MIGRATION.md](./TAILWIND_V4_MIGRATION.md) for more details.

## 🔧 Configuration

### Databricks Setup

1. **Enable Genie in your Databricks workspace**
2. **Create a Genie space**
3. **Generate a personal access token**
4. **Get your space ID from the URL**

### API Routes

The application uses Next.js API routes as a secure proxy:

- `POST /api/genie/start` - Start a new conversation
- `POST /api/genie/message` - Send a message
- `POST /api/genie/poll` - Poll for message status
- `GET /api/genie/conversations` - List conversations
- `GET /api/genie/messages` - List messages
- `POST /api/genie/feedback` - Send feedback
- `GET /api/genie/execute` - Execute SQL query

**For detailed API testing:** Import the Postman collections from the `docs/` folder.

## 📚 Documentation

### Project Documentation

- **[Technical Guide](./docs/TECHNICAL_GUIDE.md)** - Comprehensive architecture and implementation guide
- **[Tailwind v4 Migration Guide](./TAILWIND_V4_MIGRATION.md)** - CSS framework migration details
- **[Complete Optimization Summary](./COMPLETE_OPTIMIZATION_SUMMARY.md)** - Performance optimizations

### API Documentation & Testing

- **[Postman Guide](./docs/POSTMAN_GUIDE.md)** - Complete guide for API testing with Postman
- **[Databricks Genie API Collection](./docs/Databricks_Genie_API.postman_collection.json)** - Postman collection for official Databricks Genie API
- **[Genie Next.js API Collection](./docs/Genie_Next_API.postman_collection.json)** - Postman collection for our Next.js wrapper API


### External References

- **[Databricks Genie API Documentation](https://docs.databricks.com/api/workspace/genie)** - Official API documentation
- **[Databricks Genie Blog](https://www.databricks.com/blog/genie-conversation-apis-public-preview)** - Conversation APIs announcement
- **[Databricks SQL API](https://docs.databricks.com/api/workspace/sql/statements)** - SQL execution API

## 🎯 Usage

### Starting a Conversation

1. Type your question in the input field
2. Press Enter or click Send
3. Wait for Genie to process your query
4. View the results in the chat window

### Managing Conversations

- **New Conversation**: Click the "New Chat" button
- **Browse History**: Click on conversations in the sidebar
- **Mobile**: Use the menu icon to toggle the sidebar

### Providing Feedback

- Click the 👍 or 👎 icons on any message
- Optionally add a comment for the space manager
- Your feedback helps improve Genie's responses

### Suggested Questions

- Look for suggested follow-up questions below responses
- Click any suggestion to ask it automatically

## 🛠️ Development

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Lint Code
```bash
npm run lint
```

### Type Check
```bash
npx tsc --noEmit
```

### API Testing with Postman

1. Import the Postman collections from the `docs/` folder
2. Configure environment variables in Postman:
   - For Databricks API: Set `DATABRICKS_HOST`, `DATABRICKS_TOKEN`, `DATABRICKS_SPACE_ID`
   - For Next.js API: Set `BASE_URL` (default: `http://localhost:3000/api`)
3. Follow the collection workflows to test API endpoints
4. Use test scripts for automated validation

## 🏗️ Component Architecture

### Layout Components
- **AppHeader**: Application header with branding
- **AppFooter**: Footer with information
- **AppLayout**: Main layout wrapper
- **MobileOverlay**: Mobile sidebar overlay

### Page Components
- **HomePage**: Main page orchestrating the UI

### Chat Components
- **ChatWindow**: Main chat interface
- **ChatMessage**: Individual message display
- **ChatInput**: Message input field
- **ConversationSidebar**: Conversation list

### Context & Hooks
- **AppContext**: Global application state
- **useApp**: Access application state
- **useGenie**: Manage chat interactions
- **useConversations**: Manage conversation list
- **useAppState**: Application-wide side effects

## 📖 Quick Start Guide

### 1. Setup
Follow the installation steps above to configure your environment.

### 2. Start Development
```bash
npm run dev
```

### 3. Test APIs
Use the provided Postman collections to test and understand the API endpoints:
- Import `docs/Databricks_Genie_API.postman_collection.json` for direct Databricks API testing
- Import `docs/Genie_Next_API.postman_collection.json` for Next.js wrapper API testing

### 4. Review Documentation
- Read the [Technical Guide](./docs/TECHNICAL_GUIDE.md) for architecture details
- Understand the data flow and component structure
- Review best practices and security considerations

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

## 📧 Support

For support, please contact:
- Technical Issues: development@company.com
- Databricks Issues: databricks-support@company.com

**Additional Resources:**
- Review Postman collections for API examples
- Check Technical Guide for troubleshooting
- Consult Databricks official documentation

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)
- Powered by [Databricks Genie](https://databricks.com/)

