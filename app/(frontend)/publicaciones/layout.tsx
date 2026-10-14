// app/(frontend)/layout.tsx

import { getCurrentSession } from "@/lib/auth/session";
import { BarraAdmin } from "@/components/barra-admin/BarraAdmin";
import { BarraAfiliado } from "@/components/barra-afiliado/BarraAfiliado";

type Args = {
 children: React.ReactNode;
};

const Layout = async ({ children }: Args) => {
 const session = await getCurrentSession();

 if (!session) {
 return <>{children}</>;
 }

 if (session.user.role === "ADMINISTRADOR") {
 return <BarraAdmin>{children}</BarraAdmin>;
 }

 if (session.user.role === "AFILIADO") {
 return <BarraAfiliado>{children}</BarraAfiliado>;
 }

 return <>{children}</>;
};

export default Layout;
