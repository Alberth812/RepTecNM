import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";

/* 
 * CREDENCIAL PDF - VERSIÓN FINAL CORREGIDA
 * 
 * CORRECCIONES APLICADAS:
 * 1. Header blanco: El logo es azul y ya contiene el texto, por lo que el fondo debe ser blanco para que sea visible.
 * 2. Sin sobreposición: Nombre en 10pt con lineHeight, márgenes compactos y jerarquía visual clara.
 * 3. QR Garantizado: Se recibe como base64 desde el componente padre para evitar fallos de red en @react-pdf/renderer.
 * 4. Diseño Premium: Limpio, profesional, con badge de estado sin iconos.
 */

const COLORS = {
  azulInstitucional: "#004B87",
  azulOscuro: "#003366",
  dorado: "#C9A227",
  blanco: "#FFFFFF",
  grisOscuro: "#1A1A1A",
  grisMedio: "#6B7280",
  grisClaro: "#F8F9FA",
  grisBorde: "#E5E7EB",
};

const CARD_WIDTH = 153;
const CARD_HEIGHT = 243;

const styles = StyleSheet.create({
  page: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: COLORS.blanco,
    fontFamily: "Helvetica",
    overflow: "hidden",
  },
  frontContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    flexDirection: "column",
  },
  headerBar: {
    backgroundColor: COLORS.blanco,
    height: 40,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 2,
    borderBottomColor: COLORS.azulInstitucional,
  },
  logoImage: {
    width: 100, // Ancho suficiente para que se vea el logo completo con su texto integrado
    height: 28,
    objectFit: "contain",
  },
  statusBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: COLORS.dorado,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    color: COLORS.blanco,
    fontSize: 6,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  photoSection: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 6,
  },
  photoFrame: {
    width: 52,
    height: 69,
    backgroundColor: COLORS.grisClaro,
    borderWidth: 1.5,
    borderColor: COLORS.azulInstitucional,
    borderRadius: 3,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  photoPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.grisClaro,
  },
  photoPlaceholderText: {
    fontSize: 6,
    color: COLORS.grisMedio,
    textAlign: "center",
  },
  infoSection: {
    paddingHorizontal: 10,
    flex: 1,
  },
  nombreCompleto: {
    fontSize: 10, // Reducido para evitar corte en nombres largos
    fontWeight: "bold",
    color: COLORS.azulOscuro,
    textAlign: "center",
    marginBottom: 6,
    lineHeight: 1.2,
  },
  infoRow: {
    marginBottom: 5,
    paddingBottom: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.grisBorde,
  },
  infoLabel: {
    fontSize: 4.5,
    color: COLORS.grisMedio,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  infoValue: {
    fontSize: 7.5,
    color: COLORS.grisOscuro,
    fontWeight: "bold",
  },
  affiliateNumberBox: {
    backgroundColor: COLORS.grisClaro,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 3,
    marginTop: 4,
    borderLeftWidth: 2.5,
    borderLeftColor: COLORS.azulInstitucional,
  },
  affiliateNumberLabel: {
    fontSize: 4.5,
    color: COLORS.azulInstitucional,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 1,
  },
  affiliateNumber: {
    fontSize: 9,
    fontWeight: "bold",
    color: COLORS.azulOscuro,
    fontFamily: "Courier",
    letterSpacing: 1.2,
  },
  frontFooter: {
    paddingHorizontal: 10,
    paddingBottom: 6,
    alignItems: "center",
  },
  folioText: {
    fontSize: 5.5,
    color: COLORS.grisMedio,
    fontFamily: "Courier",
  },
  backContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: COLORS.azulInstitucional,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    position: "relative",
  },
  backContent: {
    alignItems: "center",
    width: "100%",
    zIndex: 1,
  },
  verificationTitle: {
    fontSize: 7,
    fontWeight: "bold",
    color: COLORS.blanco,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 3,
    letterSpacing: 0.8,
  },
  verificationSubtitle: {
    fontSize: 5.5,
    color: COLORS.blanco,
    textAlign: "center",
    marginBottom: 8,
    opacity: 0.9,
  },
  qrContainer: {
    width: 75,
    height: 75,
    backgroundColor: COLORS.blanco,
    padding: 3,
    borderRadius: 4,
    marginBottom: 10,
  },
  qrImage: {
    width: 69,
    height: 69,
  },
  folioHash: {
    fontFamily: "Courier",
    fontSize: 8,
    fontWeight: "bold",
    color: COLORS.dorado,
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 1.2,
  },
  legalNotice: {
    fontSize: 4.5,
    color: COLORS.blanco,
    textAlign: "justify",
    lineHeight: 1.3,
    marginTop: "auto",
    opacity: 0.95,
  },
  backFooterBar: {
    fontSize: 5.5,
    fontWeight: "bold",
    color: COLORS.dorado,
    marginTop: 6,
    letterSpacing: 0.3,
  },
});

interface CredencialPDFProps {
  numeroAfiliado: string;
  nombreCompleto: string;
  instituto: string;
  anioAprobacion: number;
  folio: string;
  logoUrl: string;
  fotografiaUrl?: string;
  qrCodeBase64: string; // Nuevo prop para garantizar renderizado del QR
}

export const CredencialPDF = ({
  numeroAfiliado,
  nombreCompleto,
  instituto,
  anioAprobacion,
  folio,
  logoUrl,
  fotografiaUrl,
  qrCodeBase64,
}: CredencialPDFProps) => {
  return (
    <Document>
      <Page size={[CARD_WIDTH, CARD_HEIGHT]} style={styles.page}>
        <View style={styles.frontContainer}>
          <View style={styles.headerBar}>
            <Image src={logoUrl} style={styles.logoImage} />
          </View>
          
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>ACTIVO</Text>
          </View>
          
          <View style={styles.photoSection}>
            <View style={styles.photoFrame}>
              {fotografiaUrl ? (
                <Image src={fotografiaUrl} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoPlaceholderText}>Sin{"\n"}fotografía</Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.infoSection}>
            <Text style={styles.nombreCompleto}>{nombreCompleto}</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Instituto / Unidad</Text>
              <Text style={styles.infoValue}>{instituto}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Año de Aprobación</Text>
              <Text style={styles.infoValue}>{anioAprobacion}</Text>
            </View>
            
            <View style={styles.affiliateNumberBox}>
              <Text style={styles.affiliateNumberLabel}>No. de Afiliado</Text>
              <Text style={styles.affiliateNumber}>{numeroAfiliado}</Text>
            </View>
          </View>
          
          <View style={styles.frontFooter}>
            <Text style={styles.folioText}>Folio: {folio}</Text>
          </View>
        </View>
      </Page>

      <Page size={[CARD_WIDTH, CARD_HEIGHT]} style={styles.page}>
        <View style={styles.backContainer}>
          <View style={styles.backContent}>
            <Text style={styles.verificationTitle}>Verificar Autenticidad</Text>
            <Text style={styles.verificationSubtitle}>
              Escanea el código QR o visita:
            </Text>
            
            <View style={styles.qrContainer}>
              <Image src={qrCodeBase64} style={styles.qrImage} />
            </View>
            
            <Text style={styles.folioHash}>FOLIO: {folio}</Text>
            
            <Text style={styles.legalNotice}>
              Esta credencial es propiedad de la Red de Egresados de Posgrado del TecNM (REP-TecNM). 
              Su uso es personal e intransferible. En caso de extravío, repórtelo inmediatamente. 
              La información de afiliación se valida en tiempo real a través del código QR.
            </Text>
            
            <Text style={styles.backFooterBar}>www.reptecnm.org.mx</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
