"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";

type EditPostLinkProps = {
  postId: string | number;
};

const EditPostLink = ({ postId }: EditPostLinkProps) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user?.role !== "ADMIN" && user?.role !== "MODERATOR") return null;

  return (
    <Button asChild variant="outline" size="sm">
      <Link href={`/blog/edit/${postId}`}>Sửa bài</Link>
    </Button>
  );
};

export default EditPostLink;
