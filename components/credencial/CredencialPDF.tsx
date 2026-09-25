import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";

const COLORS = {
  primary: "#004B87",
  primaryDark: "#003a6b",
  secondary: "#C9A227",
  emergency: "#DC2626",
  lightBlue: "#E6F0FA",
  white: "#FFFFFF",
  gray: "#6B7280",
  darkGray: "#2B2B2B",
};

// Dimensiones estándar ID-1 (ISO/IEC 7810): 85.60mm × 53.98mm
// En puntos: 242.6pt × 153.3pt
const CARD_WIDTH = 242.6;
const CARD_HEIGHT = 153.3;

// Margen de seguridad interno: 3mm = 8.5pt
// Todo el contenido importante debe estar dentro de este margen
const SAFE_MARGIN = 8.5;

const styles = StyleSheet.create({
  page: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: COLORS.white,
    fontFamily: "Helvetica",
  },
  // ===== FRENTE =====
  frontHeader: {
    backgroundColor: COLORS.primary,
    height: 32,
    paddingHorizontal: SAFE_MARGIN,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "bold",
  },
  headerSubtext: {
    color: COLORS.white,
    fontSize: 5.5,
  },
  statusBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 7,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 5.5,
    fontWeight: "bold",
  },
  frontBody: {
    paddingHorizontal: SAFE_MARGIN,
    paddingTop: 6,
    paddingBottom: 4,
    flexDirection: "row",
    gap: 10,
  },
  photoBox: {
    width: 50,
    height: 67,
    backgroundColor: COLORS.lightBlue,
    border: "1.5 solid " + COLORS.primary,
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  photoText: {
    fontSize: 4.5,
    color: COLORS.gray,
    textAlign: "center",
    paddingHorizontal: 2,
  },
  infoSection: {
    flex: 1,
    justifyContent: "space-between",
  },
  infoRow: {
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 4,
    color: COLORS.gray,
    textTransform: "uppercase",
    marginBottom: 1,
    letterSpacing: 0.3,
  },
  infoValue: {
    fontSize: 6.5,
    color: COLORS.darkGray,
    fontWeight: "bold",
  },
  infoValueLarge: {
    fontSize: 9,
    color: COLORS.primary,
    fontWeight: "bold",
  },
  frontFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SAFE_MARGIN,
    paddingBottom: SAFE_MARGIN,
    borderTop: "0.5 solid #E5E7EB",
  },
  folioBox: {
    flex: 1,
    paddingRight: 4,
  },
  folioLabel: {
    fontSize: 4,
    color: COLORS.gray,
    textTransform: "uppercase",
    marginBottom: 1,
  },
  folioValue: {
    fontSize: 5.5,
    color: COLORS.primary,
    fontWeight: "bold",
    fontFamily: "Courier",
  },
  qrBox: {
    width: 42,
    height: 42,
    backgroundColor: COLORS.white,
    border: "0.5 solid #E5E7EB",
    padding: 2,
    borderRadius: 2,
  },
  qrImage: {
    width: 38,
    height: 38,
  },
  // ===== REVERSO =====
  backHeader: {
    backgroundColor: COLORS.emergency,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  backHeaderText: {
    color: COLORS.white,
    fontSize: 7.5,
    fontWeight: "bold",
    letterSpacing: 1.2,
  },
  backContent: {
    paddingHorizontal: SAFE_MARGIN,
    paddingTop: 5,
    paddingBottom: SAFE_MARGIN,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 5,
    color: COLORS.primary,
    fontWeight: "bold",
    textTransform: "uppercase",
    borderBottom: "0.5 solid #E5E7EB",
    paddingBottom: 2,
    marginBottom: 4,
  },
  emergencyGrid: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 4,
  },
  emergencyCard: {
    flex: 1,
    backgroundColor: COLORS.lightBlue,
    padding: 3,
    borderRadius: 2,
    borderLeft: "1.5 solid " + COLORS.primary,
  },
  emergencyLabel: {
    fontSize: 3.5,
    color: COLORS.gray,
    textTransform: "uppercase",
    marginBottom: 1,
  },
  emergencyValue: {
    fontSize: 5.5,
    color: COLORS.darkGray,
    fontWeight: "bold",
  },
  bloodType: {
    color: COLORS.emergency,
    fontSize: 7,
  },
  contactBox: {
    backgroundColor: COLORS.lightBlue,
    padding: 4,
    borderRadius: 2,
    border: "0.5 solid #E5E7EB",
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
    fontSize: 4.5,
  },
  contactKey: {
    color: COLORS.gray,
    fontWeight: "bold",
  },
  contactValue: {
    color: COLORS.darkGray,
    fontWeight: "bold",
  },
  legalText: {
    fontSize: 3.5,
    color: COLORS.gray,
    textAlign: "center",
    lineHeight: 1.3,
    marginTop: "auto",
    paddingTop: 3,
    borderTop: "0.5 solid #D1D5DB",
  },
  websiteText: {
    fontSize: 4,
    color: COLORS.primary,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 1.5,
  },
  noDataText: {
    fontSize: 5,
    color: COLORS.gray,
    textAlign: "center",
    marginTop: 20,
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
  datosEmergencia?: {
    tipoSanguineo: string;
    alergiasCondiciones: string;
    nombreContacto: string;
    parentesco: string;
    telefono: string;
  } | null;
}

export const CredencialPDF = ({
  numeroAfiliado,
  nombreCompleto,
  instituto,
  anioAprobacion,
  folio,
  logoUrl,
  fotografiaUrl,
  datosEmergencia,
}: CredencialPDFProps) => {
  const qrUrl = `https://reptecnm.org.mx/verificar/${folio}`;
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrUrl)}`;

  return (
    <Document>
      {/* FRENTE - Tarjeta horizontal ID-1 */}
      <Page size={[CARD_WIDTH, CARD_HEIGHT]} style={styles.page} wrap={false}>
        {/* Header con degradado azul institucional */}
        <View style={styles.frontHeader}>
          <View>
            <Text style={styles.headerText}>REP-TecNM</Text>
            <Text style={styles.headerSubtext}>Red de Egresados de Posgrado</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>ACTIVO</Text>
          </View>
        </View>

        {/* Cuerpo: Foto + Información */}
        <View style={styles.frontBody}>
          <View style={styles.photoBox}>
            {fotografiaUrl ? (
              <Image src={fotografiaUrl} style={{ width: 50, height: 67 }} />
            ) : (
              <Text style={styles.photoText}>Sin{"\n"}foto</Text>
            )}
          </View>

          <View style={styles.infoSection}>
            <View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>NÚMERO DE AFILIADO</Text>
                <Text style={styles.infoValueLarge}>{numeroAfiliado}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>NOMBRE COMPLETO</Text>
                <Text style={styles.infoValue}>{nombreCompleto}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>INSTITUTO</Text>
                <Text style={styles.infoValue}>{instituto}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>AÑO</Text>
                <Text style={styles.infoValue}>{anioAprobacion}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer: Folio + QR */}
        <View style={styles.frontFooter}>
          <View style={styles.folioBox}>
            <Text style={styles.folioLabel}>FOLIO DE VERIFICACIÓN</Text>
            <Text style={styles.folioValue}>{folio}</Text>
          </View>
          <View style={styles.qrBox}>
            <Image src={qrImageSrc} style={styles.qrImage} />
          </View>
        </View>
      </Page>

      {/* REVERSO - Tarjeta horizontal ID-1 */}
      <Page size={[CARD_WIDTH, CARD_HEIGHT]} style={styles.page} wrap={false}>
        {/* Header rojo de emergencia */}
        <View style={styles.backHeader}>
          <Text style={styles.backHeaderText}>EN CASO DE EMERGENCIA</Text>
        </View>

        <View style={styles.backContent}>
          {datosEmergencia ? (
            <>
              <Text style={styles.sectionTitle}>Información Médica</Text>
              <View style={styles.emergencyGrid}>
                <View style={styles.emergencyCard}>
                  <Text style={styles.emergencyLabel}>Tipo Sanguíneo</Text>
                  <Text style={[styles.emergencyValue, styles.bloodType]}>
                    {datosEmergencia.tipoSanguineo}
                  </Text>
                </View>
                <View style={styles.emergencyCard}>
                  <Text style={styles.emergencyLabel}>Alergias</Text>
                  <Text style={styles.emergencyValue}>
                    {datosEmergencia.alergiasCondiciones || "Ninguna"}
                  </Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Contacto de Emergencia</Text>
              <View style={styles.contactBox}>
                <View style={styles.contactRow}>
                  <Text style={styles.contactKey}>Nombre:</Text>
                  <Text style={styles.contactValue}>{datosEmergencia.nombreContacto}</Text>
                </View>
                <View style={styles.contactRow}>
                  <Text style={styles.contactKey}>Parentesco:</Text>
                  <Text style={styles.contactValue}>{datosEmergencia.parentesco}</Text>
                </View>
                <View style={styles.contactRow}>
                  <Text style={styles.contactKey}>Teléfono:</Text>
                  <Text style={styles.contactValue}>{datosEmergencia.telefono}</Text>
                </View>
              </View>
            </>
          ) : (
            <Text style={styles.noDataText}>
              El afiliado no ha configurado{"\n"}datos de emergencia
            </Text>
          )}

          <View style={styles.legalText}>
            <Text>
              Esta credencial es propiedad de REP-TecNM. Datos confidenciales para uso en emergencias.
            </Text>
            <Text style={styles.websiteText}>www.reptecnm.org.mx</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
