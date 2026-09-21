import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  href?: string;
  className?: string;
  markClassName?: string;
  inverted?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { container: "h-7 w-7", img: 28 },
  md: { container: "h-9 w-9", img: 36 },
  lg: { container: "h-12 w-12", img: 48 },
};

export function Logo({
  href = "/",
  className = "",
  markClassName = "",
  inverted = false,
  size = "md",
}: LogoProps) {
  const s = sizeMap[size];

  return (
    <Link
      href={href}
      target="_self"
      className={`inline-flex items-center gap-2.5 ${className}`}
      aria-label="CuraLink home"
    >
      <span
        className={`relative flex ${s.container} items-center justify-center flex-shrink-0 ${markClassName}`}
      >
        <Image
          src="/logo.png"
          alt="CuraLink Logo"
          width={s.img}
          height={s.img}
          className="object-contain w-full h-full drop-shadow-sm"
          priority
        />
      </span>
      <span
        className={`text-[17px] font-semibold tracking-tight ${
          inverted ? "text-white" : "text-slate-900 dark:text-white"
        }`}
      >
        Cura<span className="text-teal-600 dark:text-teal-400">Link</span>
      </span>
    </Link>
  );
}
