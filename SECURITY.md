# Security Guide

Comprehensive security guidelines and best practices for SkillSwap.

## Security Overview

SkillSwap implements multiple layers of security:

1. **HTTP Security Headers** (Helmet)
2. **Input Validation** (express-validator)
3. **Rate Limiting** (express-rate-limit)
4. **Authentication** (JWT with bcrypt)
5. **CORS Protection**
6. **Error Handling** (secure error messages)
7. **Logging** (audit trail)

## Authentication & Authorization

### JWT Token Management

**Token Generation:**
- Algorithm: HS256
- Expiration: 7 days (configurable)
- Claims: `id`, `email`, `username`

**Secure Storage (Frontend):**
```javascript
// ✅ DO: Store in secure httpOnly cookie
Set-Cookie: token=xxx; HttpOnly; Secure; SameSite=Strict; Path=/

// ❌ DON'T: Store in localStorage
localStorage.setItem('token', jwtToken);
```

### Password Security

**Hashing:**
- Algorithm: bcryptjs
- Rounds: 12
- Never store plaintext passwords

**Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## Input Validation

### Validation Rules

All endpoints validate:
- Email format
- Username format
- Password strength
- String lengths
- Numeric ranges

### SQL Injection Prevention

```javascript
// ✅ DO: Use parameterized queries
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);

// ❌ DON'T: String concatenation
const query = 'SELECT * FROM users WHERE id = ' + userId;
```

## API Security

### Rate Limiting

**Authentication Endpoints:**
- 5 attempts per 15 minutes
- Applies to: login, register, password reset

**General API:**
- 100 requests per 15 minutes per IP

**WebSocket:**
- 20 connections per minute per IP

### CORS Configuration

**Production:**
```env
CORS_ORIGIN=https://your-domain.com
```

## Database Security

### Connection Security

```javascript
// Use connection pooling
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: true // Enable for remote connections
});
```

### Data Protection

**At Rest:**
- Database encryption enabled
- Regular encrypted backups
- Secrets in environment variables

**In Transit:**
- HTTPS for all API calls
- WSS for WebSocket
- TLS for database

## Environment Variables

### Production `.env`

```env
# Generate secure JWT secret
JWT_SECRET=your-generated-random-secret-32-chars

# Strong database password
DB_PASSWORD=strong_password_minimum_16_chars

# Actual deployment domain
CORS_ORIGIN=https://your-domain.com

# Security mode
NODE_ENV=production
```

### Never Commit `.env`

```bash
# .gitignore
.env
.env.local
```

## Logging & Audit Trail

### What Gets Logged

**Security Events:**
- Authentication attempts
- Authorization failures
- Rate limit exceeded
- Validation errors

**User Actions:**
- Skill operations
- Match operations
- Messages
- XP awards

### Log Access

```bash
# View logs
tail -f skillswap-backend/logs/error.log
tail -f skillswap-backend/logs/combined.log

# Search logs
grep "ERROR\|401\|403" skillswap-backend/logs/combined.log
```

## Dependency Security

### Regular Audits

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

## Security Checklist

### Development
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled
- [ ] Passwords hashed with bcrypt
- [ ] JWT tokens for authentication
- [ ] Errors don't leak sensitive info
- [ ] Dependencies audited regularly

### Deployment
- [ ] Environment variables configured
- [ ] JWT_SECRET is strong & random
- [ ] Database password is strong
- [ ] HTTPS/TLS enabled
- [ ] CORS_ORIGIN set correctly
- [ ] Security headers enabled
- [ ] Rate limiting active
- [ ] Logs configured
- [ ] Database backups encrypted
- [ ] No secrets in source code

### Monitoring
- [ ] Log review (weekly)
- [ ] Dependency updates (monthly)
- [ ] Security patches applied promptly
- [ ] Database backups tested

## Incident Response

### Suspected Breach

1. **Immediate:** Disable affected accounts
2. **Investigate:** Review authentication logs
3. **Response:** Rotate JWT_SECRET, reset passwords
4. **Deploy:** Push security patch immediately

### Security Vulnerability

1. **Report:** Email to security@your-domain.com
2. **Fix:** Apply patch immediately
3. **Update:** Audit similar issues
4. **Deploy:** Push to production

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Last Updated**: 2026-04-24  
**Version**: 1.0.0  
**Security Level**: Production-Ready
