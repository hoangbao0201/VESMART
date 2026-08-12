import Link from "next/link";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import EmptyState from "@/components/ui/EmptyState";
import UserAvatar from "@/components/ui/UserAvatar";
import { getUserByUsername } from "@/lib/api/users";
import { formatDate } from "@/lib/utils/format";

type UserProfileTemplateProps = {
  username: string;
};

const UserProfileTemplate = async ({ username }: UserProfileTemplateProps) => {
  const profile = await getUserByUsername(username);

  if (!profile) {
    return (
      <Container className="py-8 sm:py-10">
        <EmptyState
          title="Không tìm thấy thành viên"
          description={`Không có hồ sơ cho @${username}, hoặc API users chưa sẵn sàng.`}
        />
        <p className="mt-4 text-center text-sm">
          <Link href="/" className="font-medium text-primary hover:underline">
            Về trang chủ
          </Link>
        </p>
      </Container>
    );
  }

  const displayName = profile.fullName?.trim() || profile.username;

  return (
    <Container className="py-8 sm:py-10">
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: `@${profile.username}` },
        ]}
      />

      <section className="mx-auto max-w-2xl space-y-6">
        <div className="flex flex-col items-start gap-4 rounded-[12px] border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center">
          <UserAvatar
            username={profile.username}
            avatar={profile.avatar}
            size="md"
            className="size-16 text-xl"
          />
          <div className="min-w-0 space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">{displayName}</h1>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
            <p className="text-xs text-muted-foreground">
              Vai trò: {profile.role}
              {profile.createdAt ? ` · Tham gia ${formatDate(profile.createdAt)}` : null}
            </p>
          </div>
        </div>

        <div className="rounded-[12px] border border-dashed border-border bg-card px-6 py-8 text-center">
          <p className="text-sm font-semibold">Hoạt động cộng đồng</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Danh sách bài viết / chủ đề của thành viên sẽ bổ sung khi API profile mở rộng.
          </p>
        </div>
      </section>
    </Container>
  );
};

export default UserProfileTemplate;
