# Contributing to DevPulse

Thank you for your interest in contributing to DevPulse! This document provides guidelines for contributing to the project.

## Getting Started

### 1. Set Up Development Environment

Follow the [Quick Start Guide](./QUICK_START.md) to set up your development environment.

### 2. Find an Issue

Look for issues labeled ["good first issue"](https://github.com/yourusername/devpulse/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) or ["help wanted"](https://github.com/yourusername/devpulse/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22).

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

## Development Process

### 1. Make Changes

- Follow the existing code style
- Add tests for new features
- Update documentation as needed

### 2. Test Changes

```bash
# Run tests
pnpm test

# Build the project
pnpm build
```

### 3. Commit Changes

```bash
git add .
git commit -m "feat: add new feature"
```

Commit message format:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance changes

### 4. Push Changes

```bash
git push origin feature/your-feature-name
```

## Pull Request Process

1. Open a pull request
2. Fill out the PR template
3. Wait for CI checks to pass
4. Request review from maintainers
5. Address review comments
6. Merge when approved

## Code Style

### TypeScript

- Use strict mode
- Use explicit types
- Avoid `any` type
- Use `const` and `let` instead of `var`

### Formatting

- Use Prettier for code formatting
- Maximum line length: 100 characters
- Use 2 spaces for indentation

### Naming Conventions

- Variables/Functions: `camelCase`
- Types/Interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Files: `kebab-case`

## Testing

### Unit Tests

```bash
pnpm test
```

### Integration Tests

```bash
pnpm test:integration
```

### End-to-End Tests

```bash
pnpm test:e2e
```

## Documentation

### Update Documentation

- Update [README.md](./README.md) if needed
- Update [API.md](./API.md) for API changes
- Update [DEVELOPMENT.md](./DEVELOPMENT.md) for development changes

### Add New Documentation

1. Create markdown file in `docs/`
2. Add to [README.md](./README.md) if needed
3. Update navigation if needed

## Code Review

### Review Criteria

- Code quality
- Test coverage
- Documentation
- Performance
- Security

### Review Process

1. Author opens PR
2. Reviewer checks code
3. Author addresses feedback
4. Reviewer approves
5. PR is merged

## Release Process

1. Update version in `package.json`
2. Create release branch
3. Run tests
4. Merge to main
5. Create GitHub release
6. Update documentation

## Community

### Code of Conduct

Be respectful and inclusive.

### Communication

- GitHub Issues: Bug reports and feature requests
- GitHub Discussions: General discussions
- Discord: Community chat (if available)

## Questions?

- Open an issue
- Join Discord
- Email maintainers

Thank you for contributing to DevPulse!
