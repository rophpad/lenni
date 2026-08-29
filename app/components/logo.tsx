import Link from "next/link";
import Image from "next/image";

export function Logo({ link = true }: { link?: boolean }) {
  const logo = (
    <span className="mb-1 inline-flex items-center gap-2 font-display text-display-m font-bold">
      <Image
        src="/blue-lenni.svg"
        alt="Lenni"
        width={28}
        height={28}
        className="block dark:hidden"
        priority
      />
      <Image
        src="/white-lenni.svg"
        alt="Lenni"
        width={28}
        height={28}
        className="hidden dark:block"
        priority
      />
      Lenni
    </span>
  );

  if (link) {
    return <Link href="/" className="flex items-center">{logo}</Link>;
  }
  return logo;
}
