
import { QrCode } from "lucide-react";

type LogoProps = {
  className?: string;
};

const Logo = ({ className }: LogoProps) => {
  return <QrCode className={className} />;
};

export default Logo;
