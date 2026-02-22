# Authentication & User Roles Implementation Plan

## 1. User Roles Definition

### Role Matrix

| Role | Abbreviation | Scope | Description |
|------|--------------|-------|-------------|
| **Admin** | `ADMIN` | System-wide | Full system control, user management, school creation |
| **Analyst** | `ANALYST` | All assigned schools | View all schools, analytics, reports, no data editing |
| **Principal** | `PRINCIPAL` | Own school only | Complete checklists, enter data, generate reports for their school |

---

## 2. Authentication Flow

### Login Process

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Login Page │────▶│  Convex API │────▶│  JWT Token │
│  (email +   │     │  Validate   │     │  Generated │
│   password) │     │  Credentials│     │  & Stored  │
└─────────────┘     └─────────────┘     └─────────────┘
                                                  │
                                                  ▼
                                         ┌─────────────┐
                                         │  Redirect   │
                                         │  to Dashboard│
                                         └─────────────┘
```

### Authentication Methods

- **Email + Password** - Primary authentication
- **JWT Tokens** - Session management (stored in localStorage)
- **Token Expiry** - 24 hours default
- **Protected Routes** - All internal routes require authentication

---

## 3. Capability Matrix

### Admin Capabilities

| Capability | Permission |
|------------|------------|
| User Management | Create, edit, delete users |
| School Management | Create, edit, delete schools |
| System Settings | Modify global configurations |
| View All Data | Access all schools and data |
| Reports | Generate system-wide reports |
| Analytics | Full analytics access |

### Analyst Capabilities

| Capability | Permission |
|------------|------------|
| View Assigned Schools | Read-only access to assigned schools |
| Analytics | View analytics dashboards |
| Reports | Generate and export reports |
| Add Comments | Add recommendations for schools |
| No Data Editing | Cannot modify checklist data |
| No User Management | Cannot create/delete users |

### Principal Capabilities

| Capability | Permission |
|------------|------------|
| Own School Data | Full edit access to their school |
| Checklist Completion | Complete all checklists |
| Survey Management | View parent/student/teacher surveys |
| Reports | Generate school reports |
| View Analytics | View own school analytics |
| No Other Schools | Cannot access other schools |
| No User Management | Cannot create/delete users |

---

## 4. Convex Schema Updates

### New Users Table

```typescript
// app/convex/schema.ts additions

users: defineTable({
    email: v.string(),              // Unique email
    passwordHash: v.string(),        // Bcrypt hashed password
    name: v.string(),                // Full name
    role: v.union(v.literal("ADMIN"), v.literal("ANALYST"), v.literal("PRINCIPAL")),
    schoolId: v.optional(v.string()), // For PRINCIPAL - their school
    assignedSchools: v.optional(v.array(v.string())), // For ANALYST
    isActive: v.boolean(),           // Account status
    lastLogin: v.optional(v.number()), // Timestamp
    createdAt: v.number(),           // Creation timestamp
    createdBy: v.optional(v.string()), // Who created this user
})
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_schoolId", ["schoolId"])
```

### New Sessions Table

```typescript
sessions: defineTable({
    userId: v.string(),              // Reference to user
    token: v.string(),               // JWT token
    expiresAt: v.number(),           // Expiry timestamp
    createdAt: v.number(),           // Creation timestamp
})
    .index("by_userId", ["userId"])
    .index("by_token", ["token"])
```

### Schools Table (New)

```typescript
schools: defineTable({
    schoolId: v.string(),             // Unique ID (e.g., "SCH-001")
    name: v.string(),                 // School name
    nameDv: v.optional(v.string()),  // School name in Dhivehi
    atoll: v.string(),               // Atoll location
    island: v.string(),               // Island location
    isActive: v.boolean(),            // Active status
    createdAt: v.number(),
})
    .index("by_schoolId", ["schoolId"])
    .index("by_atoll", ["atoll"])
```

---

## 5. Backend API (Convex Functions)

### Authentication Functions

| Function | Purpose |
|----------|---------|
| `register` | Create new user (Admin only) |
| `login` | Authenticate user, return JWT |
| `logout` | Invalidate session |
| `getCurrentUser` | Get logged-in user info |
| `changePassword` | Allow password change |
| `resetPassword` | Admin reset user password |

### User Management Functions (Admin only)

| Function | Purpose |
|----------|---------|
| `listUsers` | Get all users with filters |
| `updateUser` | Edit user details |
| `deleteUser` | Deactivate user |
| `assignSchool` | Assign school to user |

### School Functions

| Function | Purpose |
|----------|---------|
| `listSchools` | Get all schools |
| `createSchool` | Add new school |
| `updateSchool` | Edit school details |

---

## 6. Frontend Implementation

### New Files Required

```
app/src/
├── components/
│   └── auth/
│       └── ProtectedRoute.jsx    # Route guard component
├── context/
│   └── AuthContext.jsx           # Authentication context
├── pages/
│   ├── Login.jsx                 # Login page
│   └── Login.css                 # Login styles
└── hooks/
    └── useAuth.js                # Auth hook
```

### Login Page Design

**Fields:**

- Email input (required)
- Password input (required, with show/hide toggle)
- "Remember me" checkbox
- "Forgot Password" link
- Login button

**Layout:**

- Centered card on school-themed background
- Logo at top
- Dhivehi/English bilingual labels
- Error messages for invalid credentials

### Protected Route Component

```jsx
function ProtectedRoute({ allowedRoles, children }) {
    const { user, isLoading } = useAuth();
    
    if (isLoading) return <LoadingSpinner />;
    
    if (!user) return <Navigate to="/login" />;
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" />;
    }
    
    return children;
}
```

### Auth Context Structure

```jsx
{
    user: {
        id: "user_xxx",
        email: "admin@qad.edu.mv",
        name: "Admin User",
        role: "ADMIN",
        schoolId: null,
        assignedSchools: []
    },
    isAuthenticated: true,
    isLoading: false,
    login: (email, password) => Promise,
    logout: () => Promise,
    hasPermission: (permission) => boolean
}
```

---

## 7. Route Protection

### Protected Routes Configuration

| Route | Required Role |
|-------|---------------|
| `/dashboard` | All authenticated |
| `/toolkit` | ADMIN, PRINCIPAL |
| `/school-profile` | ADMIN, PRINCIPAL |
| `/results` | ADMIN, ANALYST, PRINCIPAL |
| `/analytics` | ADMIN, ANALYST |
| `/support` | All authenticated |
| `/admin/*` | ADMIN only |
| `/login` | Public (redirect if authenticated) |

---

## 8. Implementation Steps

### Step 1: Database Schema

- [ ] Add users, sessions, schools tables to schema.ts
- [ ] Run convex deploy to update database

### Step 2: Backend Functions

- [ ] Create auth.ts with login/register/logout
- [ ] Create users.ts for user management
- [ ] Create schools.ts for school CRUD
- [ ] Add password hashing utilities

### Step 3: Frontend Auth Context

- [ ] Create AuthContext.jsx
- [ ] Create useAuth hook
- [ ] Implement login/logout logic

### Step 4: Protected Routes

- [ ] Create ProtectedRoute component
- [ ] Update App.jsx with protected routes
- [ ] Add redirect logic

### Step 5: Login Page

- [ ] Create Login.jsx component
- [ ] Create Login.css styles
- [ ] Add validation and error handling
- [ ] Implement "Remember me" functionality

### Step 6: User Management UI (Admin)

- [ ] Create user management page
- [ ] Create school management page
- [ ] Add role assignment UI

---

## 9. Security Considerations

1. **Password Storage**: Bcrypt hashing with salt rounds (10)
2. **JWT Secrets**: Stored in environment variables
3. **Token Expiry**: 24 hours for web, 7 days for "remember me"
4. **Input Validation**: Email format, password strength requirements
5. **SQL Injection**: Handled by Convex ORM
6. **CORS**: Configured for specific domains
7. **Rate Limiting**: Prevent brute force attacks
8. **Session Invalidation**: On logout or password change

---

## 10. Default Users (Seed Data)

| Email | Password | Role | School |
|-------|----------|------|--------|
| <admin@qad.edu.mv> | Admin@123 | ADMIN | - |
| <analyst@qad.edu.mv> | Analyst@123 | ANALYST | All |
| <principal@myschool.edu.mv> | Principal@123 | PRINCIPAL | School ID |
