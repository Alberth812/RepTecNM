// app/admin/layout.tsx
import { BarraAdmin } from "@/components/barra-admin/BarraAdmin";

type Args = { children: React.ReactNode };

//
const Layout = ({ children }: Args) => <BarraAdmin>{children}</BarraAdmin>;

export default Layout;
