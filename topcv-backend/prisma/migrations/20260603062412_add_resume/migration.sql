-- CreateTable
CREATE TABLE "resumes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'CV chưa đặt tên',
    "template" TEXT NOT NULL DEFAULT 'default_v2',
    "color" TEXT NOT NULL DEFAULT '#00b14f',
    "fontSize" TEXT NOT NULL DEFAULT 'medium',
    "line_spacing" DOUBLE PRECISION NOT NULL DEFAULT 1.5,
    "background" TEXT NOT NULL DEFAULT 'white',
    "content" JSONB NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
