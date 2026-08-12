import Container from "@/components/ui/Container";
import EmptyState from "@/components/ui/EmptyState";

type PagePlaceholderProps = {
  title: string;
  description?: string;
};

/** Temporary shell while a Template is implemented page-by-page. */
const PagePlaceholder = ({ title, description }: PagePlaceholderProps) => {
  return (
    <Container className="py-16 sm:py-20">
      <EmptyState title={title} description={description} />
    </Container>
  );
};

export default PagePlaceholder;
