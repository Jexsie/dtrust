# Contributing to Dtrust API

Thank you for your interest in contributing to Dtrust! This guide will help you get started with development.

## Development Setup

### Prerequisites

- Node.js v18+
- PostgreSQL
- Git
- A code editor (VS Code recommended)

### Initial Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd dtrust
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment**

   ```bash
   cp ENV_TEMPLATE.txt .env
   # Edit .env with your credentials
   ```

4. **Set up database**

   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## Project Architecture

### Directory Structure

```
src/
├── api/              # API layer
│   ├── controllers/  # Request handlers
│   ├── middleware/   # Express middleware
│   └── routes/       # Route definitions
├── services/         # Business logic
├── config/           # Configuration
├── app.ts           # Express app setup
└── server.ts        # Server entry point
```

### Key Principles

1. **Separation of Concerns**

   - Controllers handle HTTP requests/responses
   - Services contain business logic
   - Middleware handles cross-cutting concerns

2. **Type Safety**

   - Use TypeScript for all code
   - Avoid `any` types
   - Define interfaces for data structures

3. **Error Handling**

   - Use try-catch in async functions
   - Return appropriate HTTP status codes
   - Log errors for debugging

4. **Code Style**
   - Use 2 spaces for indentation
   - Use single quotes for strings
   - Add JSDoc comments for functions
   - Keep functions small and focused

## Making Changes

### Adding a New Feature

1. **Create a new branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**

   - Add new routes in `src/api/routes/`
   - Add controllers in `src/api/controllers/`
   - Add business logic in `src/services/`

3. **Test your changes**

   - Test manually with cURL or Postman
   - Ensure existing functionality still works

4. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and create a pull request**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Convention

Use conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

Examples:

```
feat: add batch document anchoring endpoint
fix: handle expired API keys correctly
docs: update API documentation for new endpoint
refactor: extract hash calculation to utility function
```

## Adding a New Endpoint

### Step-by-Step Guide

1. **Create the controller**

   Create a new file in `src/api/controllers/`:

   ```typescript
   // src/api/controllers/example.controller.ts
   import { Request, Response } from "express";

   export async function exampleFunction(
     req: Request,
     res: Response
   ): Promise<void> {
     try {
       // Your logic here
       res.status(200).json({ message: "Success" });
     } catch (error) {
       console.error("Error:", error);
       res.status(500).json({
         error: "Internal Server Error",
         message: "An error occurred",
       });
     }
   }
   ```

2. **Create the route**

   Create a new file in `src/api/routes/`:

   ```typescript
   // src/api/routes/example.routes.ts
   import { Router } from "express";
   import { exampleFunction } from "../controllers/example.controller";
   import { apiKeyAuth } from "../middleware/auth.middleware";

   const router = Router();

   router.post("/", apiKeyAuth, exampleFunction);

   export default router;
   ```

3. **Register the route in app.ts**

   ```typescript
   import exampleRoutes from "./api/routes/example.routes";

   app.use("/api/v1/example", exampleRoutes);
   ```

4. **Test the endpoint**
   ```bash
   curl -X POST http://localhost:3000/api/v1/example \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

## Database Changes

### Adding a New Model

1. **Update Prisma schema**

   Edit `prisma/schema.prisma`:

   ```prisma
   model NewModel {
     id        String   @id @default(cuid())
     field1    String
     field2    Int
     createdAt DateTime @default(now())
   }
   ```

2. **Create migration**

   ```bash
   npm run prisma:migrate
   ```

3. **Generate Prisma client**
   ```bash
   npm run prisma:generate
   ```

### Modifying Existing Models

1. Update the model in `schema.prisma`
2. Create a migration with a descriptive name
3. Test the migration on a development database
4. Update any code that uses the modified model

## Testing

### Manual Testing

Use cURL, Postman, or similar tools:

```bash
# Test anchoring
curl -X POST http://localhost:3000/api/v1/anchor \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "document=@test.txt"

# Test verification
curl -X POST http://localhost:3000/api/v1/verify \
  -F "document=@test.txt"
```

### Testing Checklist

Before submitting a PR, test:

- [ ] Happy path (expected input)
- [ ] Error cases (invalid input)
- [ ] Authentication (valid/invalid API keys)
- [ ] Edge cases (empty files, large files)
- [ ] Existing functionality still works

## Code Review Guidelines

### For Contributors

- Keep PRs focused and small
- Write descriptive commit messages
- Add comments for complex logic
- Update documentation if needed
- Test thoroughly before submitting

### For Reviewers

- Check code quality and style
- Verify functionality works as expected
- Look for security issues
- Ensure error handling is adequate
- Check for performance implications

## Common Development Tasks

### Running Prisma Studio

View and edit database contents:

```bash
npm run prisma:studio
```

### Creating Test Organizations

```bash
npx ts-node scripts/create-organization.ts "Test Org"
```

### Viewing Logs

Development server logs to console by default.

For production, consider:

- Using a logging library (Winston, Pino)
- Centralized logging (ELK, CloudWatch)
- Log rotation

### Debugging

1. **VS Code Launch Configuration**

   Create `.vscode/launch.json`:

   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "type": "node",
         "request": "launch",
         "name": "Debug Server",
         "runtimeExecutable": "npm",
         "runtimeArgs": ["run", "dev"],
         "skipFiles": ["<node_internals>/**"]
       }
     ]
   }
   ```

2. **Add breakpoints** in VS Code
3. **Start debugging** with F5

## Performance Considerations

### Best Practices

1. **Database Queries**

   - Use indexes for frequently queried fields
   - Limit the number of queries per request
   - Use Prisma's query optimization features

2. **File Handling**

   - Stream large files when possible
   - Set appropriate file size limits
   - Clean up temporary files

3. **Hedera Calls**
   - Handle rate limits
   - Implement retries for transient failures
   - Cache results when appropriate

## Security Best Practices

1. **Never commit secrets**

   - Use `.env` for sensitive data
   - Never log API keys or private keys

2. **Input Validation**

   - Validate all user input
   - Sanitize file uploads
   - Use TypeScript for type safety

3. **Error Messages**

   - Don't expose sensitive information
   - Use generic messages for security errors

4. **Dependencies**
   - Keep dependencies up to date
   - Regularly check for security vulnerabilities
   - Use `npm audit`

## Documentation

### When to Update Documentation

Update documentation when you:

- Add new endpoints
- Change API behavior
- Add new features
- Change configuration options

### Documentation Files

- `README.md` - Project overview
- `API_DOCUMENTATION.md` - API reference
- `SETUP.md` - Setup instructions
- `QUICK_START.md` - Quick start guide
- Code comments - Inline documentation

## Questions?

If you have questions:

1. Check existing documentation
2. Look at similar code in the project
3. Ask in pull request comments
4. Contact the maintainers

## License

By contributing to Dtrust, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Dtrust! 🎉
