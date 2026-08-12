import { cn } from "@/lib/utils/cn";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "footer";
};

const Container = ({ children, className, as: Tag = "div" }: ContainerProps) => {
  return (
    <Tag className={cn("mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </Tag>
  );
};

export default Container;
