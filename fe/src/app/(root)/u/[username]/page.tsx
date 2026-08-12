import type { Metadata } from "next";
import UserProfileTemplate from "@/components/modules/UserProfileTemplate";

type UserProfilePageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({
  params,
}: UserProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username}`,
    description: `Hồ sơ thành viên @${username} trên cộng đồng VESMART.`,
    alternates: { canonical: `/u/${username}` },
    openGraph: {
      title: `@${username} · VESMART`,
      description: `Hồ sơ thành viên @${username}.`,
      url: `/u/${username}`,
    },
  };
}

const UserProfilePage = async ({ params }: UserProfilePageProps) => {
  const { username } = await params;
  return <UserProfileTemplate username={username} />;
};

export default UserProfilePage;
