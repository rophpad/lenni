import Link from "next/link";
import Image from "next/image";

export function Logo() {
  return (
    <Link
      href="/"
      className="mb-1 inline-flex items-center gap-2 font-display text-display-m font-bold"
    >
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
    </Link>
  );
}
