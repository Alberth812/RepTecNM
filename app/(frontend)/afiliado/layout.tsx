// app/(frontend)/afiliado/layout.tsx
import { BarraAfiliado } from "@/components/barra-afiliado/BarraAfiliado";
import { requireAfiliado } from "@/lib/auth/session";

type Args = {
 children: React.ReactNode;
};

const Layout = async ({ children }: Args) => {
 //await requireAfiliado(["ACTIVO", "INACTIVO"]);

 return <BarraAfiliado>{children}</BarraAfiliado>;
};

export default Layout;
