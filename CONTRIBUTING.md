# Contributing to SME E-commerce Enabler

First off, thank you for your interest in contributing! We're building a platform for South African SMEs, and your help is invaluable.

## Code of Conduct

We are committed to providing a welcoming and inspiring community. Please read our Code of Conduct before contributing.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, check the issue list. When you create a bug report, include:

- **Use a clear, descriptive title**
- **Describe the exact steps which reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots if possible**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating one, include:

- **Clear, descriptive title**
- **Step-by-step description of the suggested enhancement**
- **Specific examples to demonstrate the steps**
- **Explanation of why this enhancement would be useful**
- **List of other applications where this enhancement exists**

### Pull Requests

- Fill in the required template
- Follow the code style guidelines
- Add tests for new code
- Update documentation
- End all files with a newline

## Development Workflow

### 1. Fork the Repository

```bash
git clone https://github.com/YOUR_USERNAME/SME_ecommerce.git
cd SME_ecommerce
git remote add upstream https://github.com/ORIGINAL_OWNER/SME_ecommerce.git
```

### 2. Create a Branch

```bash
# Update main
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name
```

### 3. Make Changes

```bash
# Follow code style and best practices
# Commit frequently with clear messages
git commit -m "feat: describe your feature"
git commit -m "fix: describe the bug fix"
```

### 4. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a PR on GitHub with:
- Clear title (`feat:`, `fix:`, `docs:`, etc.)
- Description of changes
- Screenshots if relevant
- Related issues

## Coding Standards

### JavaScript/Node.js

```javascript
// ✅ Good
const getUserById = async (id) => {
  if (!id) {
    throw new Error('User ID is required');
  }
  return await User.findById(id);
};

// ❌ Bad
const getUserById = (id) => {
  return User.findById(id);
};
```

- Use `async/await` instead of callbacks
- Use arrow functions
- Use template literals for strings
- Use `const` by default
- Document complex logic with comments

### React/Frontend

```javascript
// ✅ Good
const ProductCard = ({ product, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(product.id)}
    >
      {product.name}
    </div>
  );
};

// ❌ Bad - overly complex, poor naming
const PC = ({ p, o }) => {
  return <div onClick={() => o(p.id)}>{p.n}</div>;
};
```

- Use functional components
- Custom hooks for reusable logic
- Meaningful variable names
- Document complex components

### Database

```sql
-- ✅ Good
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES sme_stores(id),
    product_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ...
);

CREATE INDEX idx_products_tenant_id ON products(tenant_id);

-- ❌ Bad
CREATE TABLE p (
    id BIGINT,
    t_id BIGINT,
    n VARCHAR(100),
    ...
);
```

- Use meaningful table and column names
- Always include indexes for foreign keys
- Use appropriate data types
- Add timestamps to tables

## Git Commit Messages

```
feat: add payment gateway integration
^--^  ^------------------------------^
|     |
|     +-> Summary in imperative mood
|
+---------> Type: feat, fix, docs, style, refactor, test, chore
```

- Use the present tense ("add feature" not "added feature")
- Use the imperative mood ("move cursor to" not "moves cursor to")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally
- When applicable, include a body with more details

Examples:
- `feat: add PayFast payment integration`
- `fix: resolve cart total calculation bug`
- `docs: update API documentation for orders endpoint`
- `refactor: optimize product search query`
- `test: add unit tests for user service`

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests for specific service
cd services/api-gateway
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

### Writing Tests

```javascript
describe('Product Service', () => {
  it('should return product by ID', async () => {
    const product = await getProductById('prod-uuid');
    expect(product).toBeDefined();
    expect(product.id).toBe('prod-uuid');
  });

  it('should throw error for invalid ID', async () => {
    await expect(getProductById(null)).rejects.toThrow();
  });
});
```

## Documentation

- Update README.md for new features
- Document API changes in API_DOCS.md
- Add JSDoc comments for functions
- Include examples in code
- Update DEVELOPMENT.md for setup changes

## Local Review Checklist

Before submitting a PR:

- [ ] Code follows style guidelines
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass locally
- [ ] No console errors/warnings
- [ ] No hardcoded secrets
- [ ] Commits are clean and logical
- [ ] Branch is up to date with main

## PR Review Process

1. **Automated Checks**
   - CI/CD pipeline runs tests
   - Code style checks
   - Security scanning

2. **Manual Review**
   - Team reviews code
   - Suggestions for improvements
   - Approval or requested changes

3. **Merge**
   - PR merged to main or develop
   - Automatic deployment (if applicable)

## Getting Help

- **Questions**: Open a discussion or issue
- **Documentation**: Check docs/ folder
- **Community**: [Join our Slack/Discord]

## Recognition

We appreciate all contributions! Contributors will be recognized in:
- README.md
- Release notes
- Contributors list

## Resources

- [GitHub Git Handbook](https://guides.github.com/introduction/git-handbook/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [React Best Practices](https://react.dev/learn)

## License

By contributing, you agree that your contributions will be licensed under the project's license.

---

Happy contributing! 🚀
