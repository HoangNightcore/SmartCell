# 📱 Mobile Store – Fullstack E-commerce Website
Một ứng dụng E-commerce bán điện thoại di động được xây dựng với Next.js 14 và NestJS, áp dụng kiến trúc hiện đại, CI/CD, Docker và triển khai theo mô hình Agile/Scrum.

## 🚀 Tech Stack

**Frontend**
* **Next.js 14** – React framework với App Router
* **TypeScript** – JavaScript an toàn kiểu dữ liệu
* **Material-UI** – Thư viện component cho React
* **React Query** – Xử lý lấy và cache dữ liệu
* **React Hook Form** – Xử lý form và validation
* **Zustand** – Quản lý state gọn nhẹ
* **Next-Auth** – Xác thực người dùng

---

**Backend**
* **NestJS** – Framework Node.js
* **TypeScript** – Phát triển an toàn kiểu dữ liệu
* **Prisma** – ORM thế hệ mới
* **PostgreSQL** – Cơ sở dữ liệu quan hệ
* **Redis** – Caching trong bộ nhớ & lưu trữ session
* **Passport** – Xác thực & phân quyền
* **Stripe** – Cổng thanh toán

---

**DevOps & Tools**
* **Docker** – Đóng gói container
* **GitHub Actions** – Pipelines CI/CD
* **Vercel** – Triển khai Frontend
* **Railway** – Triển khai Backend + DB
* **Cloudinary** – Lưu trữ hình ảnh & video
* **Sentry** – Giám sát lỗi

---

## ✨ Features

### 🛍️ Customer
* **Product Catalog**: Tìm kiếm và lọc nâng cao
* **Product Details**: Thông tin chi tiết, thư viện ảnh, đánh giá
* **Shopping Cart**: Giỏ hàng liên tục
* **Secure Checkout**: Tích hợp Stripe
* **Order Tracking**: Cập nhật trạng thái đơn hàng theo thời gian thực
* **User Profiles**: Tài khoản, đơn hàng, danh sách yêu thích
* **Reviews & Ratings**: Đánh giá và xếp hạng có thể tải ảnh lên
* **Responsive Design**: Hỗ trợ di động/máy tính bảng/máy tính để bàn

### 👨‍💼 Admin
* **Dashboard Analytics**: Báo cáo bán hàng, doanh thu, KPI
* **Product Management**: CRUD và thao tác hàng loạt
* **Order Management**: Cập nhật trạng thái và xử lý đơn hàng
* **Customer Management**: Quản lý tài khoản, hỗ trợ
* **Inventory Management**: Theo dõi tồn kho, cảnh báo
* **Content Management**: Khuyến mãi, banner

### 🔧 Technical
* **JWT Auth** với Refresh Tokens
* **Role-based Access Control** (Customer/Admin)
* **Stripe Webhook** cho thanh toán
* **Cloudinary** tải tệp & tối ưu hóa
* **Transactional Emails** (xác nhận đơn hàng)
* **WebSockets** cho thông báo thời gian thực
* **Redis** caching layer
* **PostgreSQL** full-text search
* **API rate limiting**

---

## 📂 Project Structure (Monorepo với Turborepo)
```bash
smartcell-ecommerce/
├── 📄 README.md
├── 📄 package.json                 # Root workspace config
├── 📄 yarn.lock
├── 📄 .gitignore
├── 📄 docker-compose.yml
├── 📄 docker-compose.prod.yml
├── 📄 .env.example
├── 📄 .eslintrc.js                 # Shared ESLint config
├── 📄 .prettierrc                  # Shared Prettier config
├── 📄 tsconfig.json                # Base TypeScript config
├── 📄 .github/workflows/           # CI/CD pipelines
├── 📄 turbo.json                   # Turborepo config (optional)
│
├── 📁 apps/    
│   ├── 📁 frontend/           # Next.js Frontend App
│   │   ├── 📄 package.json
│   │   ├── 📄 next.config.js
│   │   ├── 📄 tsconfig.json
│   │   ├── 📄 tailwind.config.js   # If using Tailwind
│   │   ├── 📄 .env.local
│   │   ├── 📄 .env.example
│   │   ├── 📄 Dockerfile
│   │   ├── 📄 Dockerfile.prod
│   │   │
│   │   ├── 📁 public/
│   │   │   ├── 📄 favicon.ico
│   │   │   ├── 📄 logo.png
│   │   │   ├── 📁 images/
│   │   │   └── 📁 icons/
│   │   │
│   │   └── 📁 src/
│   │       ├── 📁 app/              # App Router (Next.js 13+)
│   │       │   ├── 📄 layout.tsx    # Root layout
│   │       │   ├── 📄 page.tsx      # Home page
│   │       │   ├── 📄 loading.tsx   # Global loading UI
│   │       │   ├── 📄 error.tsx     # Global error UI
│   │       │   ├── 📄 not-found.tsx # 404 page
│   │       │   ├── 📄 globals.css   # Global styles
│   │       │   │
│   │       │   ├── 📁 (auth)/       # Route group
│   │       │   │   ├── 📄 layout.tsx
│   │       │   │   ├── 📁 login/
│   │       │   │   │   └── 📄 page.tsx
│   │       │   │   ├── 📁 register/
│   │       │   │   │   └── 📄 page.tsx
│   │       │   │   └── 📁 forgot-password/
│   │       │   │       └── 📄 page.tsx
│   │       │   │
│   │       │   ├── 📁 products/
│   │       │   │   ├── 📄 page.tsx
│   │       │   │   ├── 📄 loading.tsx
│   │       │   │   └── 📁 [slug]/
│   │       │   │       └── 📄 page.tsx
│   │       │   │
│   │       │   ├── 📁 cart/
│   │       │   │   └── 📄 page.tsx
│   │       │   │
│   │       │   ├── 📁 checkout/
│   │       │   │   ├── 📄 page.tsx
│   │       │   │   └── 📁 success/
│   │       │   │       └── 📄 page.tsx
│   │       │   │
│   │       │   ├── 📁 profile/
│   │       │   │   ├── 📄 layout.tsx
│   │       │   │   ├── 📄 page.tsx
│   │       │   │   ├── 📁 orders/
│   │       │   │   ├── 📁 addresses/
│   │       │   │   └── 📁 settings/
│   │       │   │
│   │       │   ├── 📁 admin/
│   │       │   │   ├── 📄 layout.tsx
│   │       │   │   ├── 📄 page.tsx
│   │       │   │   ├── 📁 products/
│   │       │   │   ├── 📁 orders/
│   │       │   │   ├── 📁 customers/
│   │       │   │   ├── 📁 analytics/
│   │       │   │   └── 📁 settings/
│   │       │   │
│   │       │   └── 📁 api/          # API routes (if needed)
│   │       │       └── 📁 auth/
│   │       │           └── 📄 route.ts
│   │       │
│   │       ├── 📁 components/       # Reusable UI components
│   │       │   ├── 📁 ui/           # Basic UI components
│   │       │   │   ├── 📄 Button.tsx
│   │       │   │   ├── 📄 Input.tsx
│   │       │   │   ├── 📄 Card.tsx
│   │       │   │   ├── 📄 Modal.tsx
│   │       │   │   └── 📄 index.ts  # Export all
│   │       │   │
│   │       │   ├── 📁 layout/       # Layout components
│   │       │   │   ├── 📄 Header.tsx
│   │       │   │   ├── 📄 Footer.tsx
│   │       │   │   ├── 📄 Sidebar.tsx
│   │       │   │   ├── 📄 Navbar.tsx
│   │       │   │   └── 📄 MobileMenu.tsx
│   │       │   │
│   │       │   ├── 📁 forms/        # Form components
│   │       │   │   ├── 📄 LoginForm.tsx
│   │       │   │   ├── 📄 RegisterForm.tsx
│   │       │   │   ├── 📄 ProductForm.tsx
│   │       │   │   ├── 📄 CheckoutForm.tsx
│   │       │   │   └── 📄 ContactForm.tsx
│   │       │   │
│   │       │   ├── 📁 product/      # Product-related components
│   │       │   │   ├── 📄 ProductCard.tsx
│   │       │   │   ├── 📄 ProductList.tsx
│   │       │   │   ├── 📄 ProductDetail.tsx
│   │       │   │   ├── 📄 ProductFilter.tsx
│   │       │   │   ├── 📄 ProductSearch.tsx
│   │       │   │   └── 📄 ProductGallery.tsx
│   │       │   │
│   │       │   ├── 📁 cart/         # Cart components
│   │       │   │   ├── 📄 CartDrawer.tsx
│   │       │   │   ├── 📄 CartItem.tsx
│   │       │   │   ├── 📄 CartSummary.tsx
│   │       │   │   └── 📄 CartButton.tsx
│   │       │   │
│   │       │   ├── 📁 checkout/     # Checkout components
│   │       │   │   ├── 📄 CheckoutStepper.tsx
│   │       │   │   ├── 📄 PaymentForm.tsx
│   │       │   │   ├── 📄 ShippingForm.tsx
│   │       │   │   └── 📄 OrderSummary.tsx
│   │       │   │
│   │       │   ├── 📁 admin/        # Admin components
│   │       │   │   ├── 📄 AdminLayout.tsx
│   │       │   │   ├── 📄 AdminSidebar.tsx
│   │       │   │   ├── 📄 AdminHeader.tsx
│   │       │   │   ├── 📄 ProductDataGrid.tsx
│   │       │   │   ├── 📄 OrderDataGrid.tsx
│   │       │   │   ├── 📄 AnalyticsDashboard.tsx
│   │       │   │   └── 📄 StatsCard.tsx
│   │       │   │
│   │       │   └── 📁 common/       # Common components
│   │       │       ├── 📄 Loading.tsx
│   │       │       ├── 📄 ErrorBoundary.tsx
│   │       │       ├── 📄 SEO.tsx
│   │       │       ├── 📄 Breadcrumbs.tsx
│   │       │       ├── 📄 Pagination.tsx
│   │       │       └── 📄 SearchBar.tsx
│   │       │
│   │       ├── 📁 hooks/            # Custom React hooks
│   │       │   ├── 📄 useAuth.ts
│   │       │   ├── 📄 useCart.ts
│   │       │   ├── 📄 useProducts.ts
│   │       │   ├── 📄 useOrders.ts
│   │       │   ├── 📄 useLocalStorage.ts
│   │       │   ├── 📄 useDebounce.ts
│   │       │   └── 📄 usePagination.ts
│   │       │
│   │       ├── 📁 lib/              # Utility libraries
│   │       │   ├── 📄 api.ts        # API client setup
│   │       │   ├── 📄 auth.ts       # Auth utilities
│   │       │   ├── 📄 validations.ts# Form validations
│   │       │   ├── 📄 constants.ts  # App constants
│   │       │   ├── 📄 utils.ts      # General utilities
│   │       │   ├── 📄 formatting.ts # Data formatting
│   │       │   └── 📄 storage.ts    # Local storage utils
│   │       │
│   │       ├── 📁 store/            # State management
│   │       │   ├── 📄 index.ts      # Store setup
│   │       │   ├── 📄 authStore.ts  # Auth state
│   │       │   ├── 📄 cartStore.ts  # Cart state
│   │       │   ├── 📄 productStore.ts# Product state
│   │       │   └── 📄 uiStore.ts    # UI state
│   │       │
│   │       ├── 📁 styles/           # Styles (if using CSS modules/SCSS)
│   │       │   ├── 📄 globals.css
│   │       │   ├── 📄 components.css
│   │       │   └── 📄 utilities.css
│   │       │
│   │       ├── 📁 theme/            # Theme configuration
│   │       │   ├── 📄 theme.ts      # Material-UI theme
│   │       │   ├── 📄 colors.ts
│   │       │   └── 📄 typography.ts
│   │       │
│   │       └── 📁 types/            # TypeScript type definitions
│   │           ├── 📄 index.ts      # Main types export
│   │           ├── 📄 auth.ts       # Auth types
│   │           ├── 📄 product.ts    # Product types
│   │           ├── 📄 cart.ts       # Cart types
│   │           ├── 📄 order.ts      # Order types
│   │           ├── 📄 user.ts       # User types
│   │           └── 📄 api.ts        # API response types
│   │
│   └── 📁 backend/            # NestJS Backend App
│       ├── 📄 package.json
│       ├── 📄 nest-cli.json
│       ├── 📄 tsconfig.json
│       ├── 📄 tsconfig.build.json
│       ├── 📄 .env
│       ├── 📄 .env.example
│       ├── 📄 Dockerfile
│       ├── 📄 Dockerfile.prod
│       │
│       ├── 📁 prisma/              # Database schema & migrations
│       │   ├── 📄 schema.prisma
│       │   ├── 📄 seed.ts
│       │   └── 📁 migrations/
│       │
│       ├── 📁 src/
│       │   ├── 📄 main.ts           # Application entry point
│       │   ├── 📄 app.module.ts     # Root module
│       │   ├── 📄 app.controller.ts
│       │   ├── 📄 app.service.ts
│       │   │
│       │   ├── 📁 auth/             # Authentication module
│       │   │   ├── 📄 auth.module.ts
│       │   │   ├── 📄 auth.controller.ts
│       │   │   ├── 📄 auth.service.ts
│       │   │   ├── 📄 jwt.strategy.ts
│       │   │   ├── 📄 local.strategy.ts
│       │   │   ├── 📁 dto/
│       │   │   │   ├── 📄 login.dto.ts
│       │   │   │   ├── 📄 register.dto.ts
│       │   │   │   └── 📄 refresh-token.dto.ts
│       │   │   └── 📁 guards/
│       │   │       ├── 📄 jwt-auth.guard.ts
│       │   │       ├── 📄 roles.guard.ts
│       │   │       └── 📄 local-auth.guard.ts
│       │   │
│       │   ├── 📁 users/            # Users module
│       │   │   ├── 📄 users.module.ts
│       │   │   ├── 📄 users.controller.ts
│       │   │   ├── 📄 users.service.ts
│       │   │   ├── 📁 dto/
│       │   │   │   ├── 📄 create-user.dto.ts
│       │   │   │   ├── 📄 update-user.dto.ts
│       │   │   │   └── 📄 user-response.dto.ts
│       │   │   └── 📁 entities/
│       │   │       └── 📄 user.entity.ts
│       │   │
│       │   ├── 📁 products/         # Products module
│       │   │   ├── 📄 products.module.ts
│       │   │   ├── 📄 products.controller.ts
│       │   │   ├── 📄 products.service.ts
│       │   │   ├── 📁 dto/
│       │   │   │   ├── 📄 create-product.dto.ts
│       │   │   │   ├── 📄 update-product.dto.ts
│       │   │   │   ├── 📄 product-filter.dto.ts
│       │   │   │   └── 📄 product-response.dto.ts
│       │   │   └── 📁 entities/
│       │   │       └── 📄 product.entity.ts
│       │   │
│       │   ├── 📁 orders/           # Orders module
│       │   │   ├── 📄 orders.module.ts
│       │   │   ├── 📄 orders.controller.ts
│       │   │   ├── 📄 orders.service.ts
│       │   │   ├── 📁 dto/
│       │   │   └── 📁 entities/
│       │   │
│       │   ├── 📁 cart/             # Cart module
│       │   │   ├── 📄 cart.module.ts
│       │   │   ├── 📄 cart.controller.ts
│       │   │   ├── 📄 cart.service.ts
│       │   │   ├── 📁 dto/
│       │   │   └── 📁 entities/
│       │   │
│       │   ├── 📁 payments/         # Payments module
│       │   │   ├── 📄 payments.module.ts
│       │   │   ├── 📄 payments.controller.ts
│       │   │   ├── 📄 payments.service.ts
│       │   │   ├── 📄 stripe.service.ts
│       │   │   └── 📁 dto/
│       │   │
│       │   ├── 📁 reviews/          # Reviews module
│       │   │   ├── 📄 reviews.module.ts
│       │   │   ├── 📄 reviews.controller.ts
│       │   │   ├── 📄 reviews.service.ts
│       │   │   ├── 📁 dto/
│       │   │   └── 📁 entities/
│       │   │
│       │   ├── 📁 admin/            # Admin module
│       │   │   ├── 📄 admin.module.ts
│       │   │   ├── 📄 admin.controller.ts
│       │   │   ├── 📄 admin.service.ts
│       │   │   └── 📄 analytics.service.ts
│       │   │
│       │   ├── 📁 common/           # Common utilities
│       │   │   ├── 📁 decorators/
│       │   │   │   ├── 📄 roles.decorator.ts
│       │   │   │   └── 📄 user.decorator.ts
│       │   │   ├── 📁 filters/
│       │   │   │   ├── 📄 http-exception.filter.ts
│       │   │   │   └── 📄 validation-exception.filter.ts
│       │   │   ├── 📁 interceptors/
│       │   │   │   ├── 📄 transform.interceptor.ts
│       │   │   │   └── 📄 logging.interceptor.ts
│       │   │   ├── 📁 pipes/
│       │   │   │   └── 📄 validation.pipe.ts
│       │   │   ├── 📁 middleware/
│       │   │   │   └── 📄 logger.middleware.ts
│       │   │   └── 📁 constants/
│       │   │       ├── 📄 roles.constant.ts
│       │   │       └── 📄 messages.constant.ts
│       │   │
│       │   ├── 📁 config/           # Configuration
│       │   │   ├── 📄 database.config.ts
│       │   │   ├── 📄 jwt.config.ts
│       │   │   ├── 📄 redis.config.ts
│       │   │   └── 📄 cloudinary.config.ts
│       │   │
│       │   └── 📁 utils/            # Utility functions
│       │       ├── 📄 bcrypt.util.ts
│       │       ├── 📄 email.util.ts
│       │       ├── 📄 file-upload.util.ts
│       │       └── 📄 pagination.util.ts
│       │
│       └── 📁 test/                 # Tests
│           ├── 📄 app.e2e-spec.ts
│           ├── 📄 jest-e2e.json
│           └── 📁 unit/
│               ├── 📁 auth/
│               ├── 📁 users/
│               └── 📁 products/
│
├── 📁 packages/                     # Shared packages (optional)
│   ├── 📁 shared/                   # Shared types & utilities
│   │   ├── 📄 package.json
│   │   ├── 📄 tsconfig.json
│   │   └── 📁 src/
│   │       ├── 📁 types/            # Shared TypeScript types
│   │       │   ├── 📄 user.ts
│   │       │   ├── 📄 product.ts
│   │       │   ├── 📄 order.ts
│   │       │   └── 📄 index.ts
│   │       ├── 📁 constants/        # Shared constants
│   │       │   ├── 📄 api.ts
│   │       │   ├── 📄 roles.ts
│   │       │   └── 📄 status.ts
│   │       └── 📁 utils/            # Shared utilities
│   │           ├── 📄 formatting.ts
│   │           ├── 📄 validation.ts
│   │           └── 📄 helpers.ts
│   │
│   └── 📁 ui/                       # Shared UI components (optional)
│       ├── 📄 package.json
│       ├── 📄 tsconfig.json
│       └── 📁 src/
│           ├── 📁 components/
│           └── 📁 hooks/
│
├── 📁 docker/                       # Docker configurations
│   ├── 📄 Dockerfile.frontend
│   ├── 📄 Dockerfile.backend
│   ├── 📄 docker-compose.dev.yml
│   ├── 📄 docker-compose.prod.yml
│   └── 📁 nginx/
│       └── 📄 nginx.conf
│
├── 📁 docs/                         # Documentation
│   ├── 📄 API.md                    # API documentation
│   ├── 📄 DEPLOYMENT.md             # Deployment guide
│   ├── 📄 CONTRIBUTING.md           # Contribution guidelines
│   ├── 📄 ARCHITECTURE.md           # System architecture
│   ├── 📁 diagrams/                 # Architecture diagrams
│   ├── 📁 postman/                  # Postman collections
│   └── 📁 screenshots/              # App screenshots
│
├── 📁 .github/                      # GitHub workflows & templates
│   ├── 📁 workflows/
│   │   ├── 📄 ci.yml               # Continuous Integration
│   │   ├── 📄 cd.yml               # Continuous Deployment
│   │   ├── 📄 pr-check.yml         # PR checks
│   │   └── 📄 release.yml          # Release workflow
│   ├── 📁 ISSUE_TEMPLATE/
│   │   ├── 📄 bug-report.md
│   │   ├── 📄 feature-request.md
│   │   └── 📄 user-story.md
│   └── 📄 pull_request_template.md
│
├── 📁 scripts/                      # Build & deployment scripts
│   ├── 📄 setup.sh                  # Initial setup script
│   ├── 📄 build.sh                  # Build script
│   ├── 📄 deploy.sh                 # Deployment script
│   └── 📄 seed-data.js              # Database seeding
│
└── 📁 infra/                        # Infrastructure as Code (optional)
    ├── 📁 terraform/                # Terraform configs
    ├── 📁 kubernetes/               # K8s manifests
    └── 📁 ansible/                  # Ansible playbooks
```

---

## 📖 Conventions

**Git Workflow**
* `main`: Sẵn sàng cho production
* `develop`: Nhánh tích hợp
* `feature/*`: Các tính năng mới
* `fix/*`: Sửa lỗi

**Commit Messages**
* `feat: add product search`
* `fix: resolve login bug`
* `chore: update dependencies`
* `docs: add API documentation`

**Code Style**
* **Frontend**: ESLint + Prettier (theo phong cách Airbnb)
* **Backend**: NestJS style guide (Controller → Service → Repository)
* **Testing**: Jest (unit) + Cypress/Playwright (e2e)

**Pull Requests**
* PR nhỏ gọn (<400 dòng)
* Bắt buộc xem xét mã (code review)

---

## ⚡ Getting Started

**Prerequisites**
* Node.js 20+
* Docker & Docker Compose
* PostgreSQL & Redis (qua Docker)

**Development Setup**
```bash
# Clone repo
git clone https://github.com/HoangNightcore/SmartCell.git
cd mobile-store

# Cài đặt các dependencies
pnpm install

# Khởi chạy môi trường dev (backend + frontend + db)
docker-compose up -d
```

**Run Frontend**
```bash
cd apps/frontend
pnpm dev
```

**Run Backend**
```bash
cd apps/backend
pnpm start:dev
```

---

## 🤖 CI/CD
- GitHub Actions: Lint → Test → Build → Deploy
- Frontend: Tự động triển khai lên Vercel
- Backend: Tự động triển khai lên Railway với Docker
- Database: PostgreSQL + Redis trên Railway

---

## 📊 Agile/Scrum Workflow
- Tool: Jira (Epics → Stories → Tasks)
- Sprints: 1–2 tuần
- Definition of Done (Định nghĩa Hoàn thành):
    - Mã nguồn đã được xem xét & gộp
    - Các bài kiểm tra unit/e2e đã vượt qua
    - CI/CD pipeline đã thành công
    - Demo đã được triển khai (Vercel/Railway)

---

## 🛠️ Testing
- Unit Tests: Jest (frontend + backend)
- Integration Tests: Supertest (NestJS)
- E2E Tests: Cypress hoặc Playwright (frontend flows)

---

# Run tests:
```bash
pnpm test
```

---

## 📦 Deployment
- Frontend: Vercel (tự động triển khai từ nhánh main)
- Backend: Railway với Docker
- Database: PostgreSQL + Redis trên Railway
- Images: Cloudinary
- Payments: Stripe (chế độ thử nghiệm)

---

## 📌 Roadmap
- Sprint 1: Auth (JWT + Roles)
- Sprint 2: Product Catalog
- Sprint 3: Cart & Checkout (Stripe)
- Sprint 4: User Profiles + Reviews
- Sprint 5: Admin Dashboard
- Sprint 6: DevOps, Giám sát, QA cuối cùng

---

## 👨‍💻 Author
- Nguyễn Minh Hoàng – Fullstack Developer
- Chuyên môn: Phát triển Web, DevOps, Thiết kế Cơ sở dữ liệu
- 🌐 [Thay đổi đường dẫn liên kết LinkedIn/GitHub của bạn tại đây]