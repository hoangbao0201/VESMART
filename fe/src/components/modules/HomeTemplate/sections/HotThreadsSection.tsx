import type { ThreadListItem } from "@/types/forum";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import ThreadRow from "@/components/ui/ThreadRow";
import EmptyState from "@/components/ui/EmptyState";

type HotThreadsSectionProps = {
  threads: ThreadListItem[];
};

const HotThreadsSection = ({ threads }: HotThreadsSectionProps) => {
  return (
    <section className="pb-16 pt-4 sm:pb-20 sm:pt-8" aria-labelledby="hot-threads-heading">
      <Container>
        <SectionHeading
          id="hot-threads-heading"
          title="Thảo luận đang nóng"
          description="Chủ đề mới cập nhật trên diễn đàn - hỏi đáp theo từng thương hiệu."
          href="/forum"
          linkLabel="Vào diễn đàn"
        />
        {threads.length === 0 ? (
          <EmptyState
            title="Chưa có chủ đề"
            description="Dữ liệu sẽ hiển thị khi API forum sẵn sàng."
          />
        ) : (
          <ul className="vesmart-fade-in flex flex-col gap-2">
            {threads.map((thread) => (
              <li key={thread.id}>
                <ThreadRow thread={thread} />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
};

export default HotThreadsSection;
