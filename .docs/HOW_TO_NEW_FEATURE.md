# Thêm một tính năng mới

Ví dụ xuyên suốt: tính năng **bài viết** (`posts`) — tạo và xem bài viết.

## 0. Lên kế hoạch
Chạy `/system-planner` (hoặc tự cập nhật `.docs/DESIGN_BRIEF.md`): endpoint nào, bảng nào, thuộc module nào, có thao tác tranh chấp nào không.

## 1. Database
`apps/backend/prisma/schema.prisma`:
```prisma
model Post {
  id        String   @id @default(cuid())
  title     String
  createdAt DateTime @default(now()) @map("created_at")

  @@map("posts")
}
```
```bash
pnpm db:migrate --name add_posts   # tạo + áp migration, sinh lại Prisma Client
```

## 2. Module backend
```bash
cd apps/backend && pnpm exec nest g module modules/posts && pnpm exec nest g controller modules/posts --flat && pnpm exec nest g service modules/posts --flat
```
Sửa import do CLI sinh thành đuôi `.js` nếu thiếu.

**DTO** — `dto/create-post.dto.ts` và `dto/post.dto.ts`:
```ts
export class CreatePostDto {
  /** @example "Xôi gấc ngày Tết" */
  @IsString() @MinLength(3) @MaxLength(200)
  title: string;
}

export class PostDto {
  id: string;
  title: string;
  createdAt: Date;
  static from(post: Post): PostDto {
    return { id: post.id, title: post.title, createdAt: post.createdAt };
  }
}
```

**Service** — nghiệp vụ + Prisma:
```ts
@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePostDto): Promise<PostDto> {
    return PostDto.from(await this.prisma.post.create({ data: dto }));
  }

  async findOne(id: string): Promise<PostDto> {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');
    return PostDto.from(post);
  }
}
```

**Controller** — chỉ điều phối:
```ts
@ApiTags('posts')
@Controller('posts')                       // → /api/v1/posts
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  /** Tạo bài viết. */
  @Post()
  create(@Body() dto: CreatePostDto): Promise<PostDto> {
    return this.posts.create(dto);
  }

  /** Xem một bài viết. */
  @Get(':id')
  findOne(@Param('id') id: string): Promise<PostDto> {
    return this.posts.findOne(id);
  }
}
```
Thêm `PostsModule` vào `imports` của `AppModule`. Mở `http://localhost:4000/api/docs` để kiểm tra Swagger.

## 3. Test
`apps/backend/test/posts.e2e-spec.ts` — dùng `createTestApp()` như `foundation.e2e-spec.ts`. Tối thiểu:
- tạo bài → 201, xem lại đúng dữ liệu
- input sai → 400 `VALIDATION_FAILED`
- xem bài không tồn tại → 404

```bash
pnpm test:e2e
```

## 4. Frontend
```tsx
// app/posts/[id]/page.tsx — Server Component
import { Suspense } from "react";
import { apiServer } from "@/lib/api/server";

export default async function PostPage({ params }: PageProps<"/posts/[id]">) {
  const { id } = await params;
  return <Suspense fallback={<p>Đang tải…</p>}><PostView id={id} /></Suspense>;
}

async function PostView({ id }: { id: string }) {
  const post = await apiServer<{ title: string }>(`/v1/posts/${id}`);
  return <h1>{post.title}</h1>;
}
```
Form tạo bài là Client Component (tách khỏi `page.tsx`), dùng TanStack Query + Axios:
```tsx
"use client";
import { useMutation } from "@tanstack/react-query";
import { http } from "@/lib/api/http";

export function CreatePostForm() {
  const create = useMutation({
    mutationFn: (title: string) => http.post<PostDto>("/v1/posts", { title }).then((r) => r.data),
  });
  // create.error là ApiError → hiển thị theo create.error.code
}
```
Ô tìm kiếm: `const q = useDebounce(input, 400)` rồi dùng `q` trong `queryKey` của `useQuery`.

## 5. Hoàn tất
- [ ] `pnpm check` pass, `pnpm test:e2e` pass
- [ ] Cập nhật `.docs/ARCHITECTURE.md` (module, bảng, endpoint)
- [ ] Biến env mới đã thêm vào `env.schema.ts` + `.env.example`
- [ ] Chạy `/save-context`
- [ ] Commit `feat: ...`
