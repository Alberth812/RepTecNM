import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import QRCode from "qrcode";

const COLORS = {
  azulOscuro: "#003366",
  azulMedio: "#004B87",
  azulClaro: "#E6F0FA",
  dorado: "#C9A227",
  rojoEmergencia: "#DC2626",
  grisOscuro: "#2B2B2B",
  grisMedio: "#6B7280",
  blanco: "#FFFFFF",
};

// Tamaño estándar ID-1 horizontal: 85.6mm × 53.98mm ≈ 242pt × 153pt
const CARD_WIDTH = 242;
const CARD_HEIGHT = 153;

const styles = StyleSheet.create({
  page: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: COLORS.blanco,
    fontFamily: "Helvetica",
    overflow: "hidden",
  },
  // ===== FRENTE =====
  frontContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    flexDirection: "column",
  },
  header: {
    backgroundColor: COLORS.azulMedio,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "column",
  },
  headerTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.blanco,
    marginBottom: 1,
  },
  headerSubtitle: {
    fontSize: 6,
    color: COLORS.blanco,
    opacity: 0.9,
  },
  statusBadge: {
    backgroundColor: COLORS.dorado,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 7,
    fontWeight: "bold",
    color: COLORS.blanco,
  },
  body: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 8,
  },
  photoContainer: {
    width: 50,
    height: 67,
    backgroundColor: COLORS.azulClaro,
    border: "1.5 solid " + COLORS.azulMedio,
    borderRadius: 3,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  infoContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  infoRow: {
    marginBottom: 3,
  },
  infoLabel: {
    fontSize: 4,
    color: COLORS.grisMedio,
    textTransform: "uppercase",
    marginBottom: 1,
    letterSpacing: 0.3,
  },
  infoValue: {
    fontSize: 7,
    color: COLORS.grisOscuro,
    fontWeight: "bold",
  },
  infoValueLarge: {
    fontSize: 10,
    color: COLORS.azulMedio,
    fontWeight: "bold",
  },
  qrContainer: {
    width: 45,
    height: 45,
    backgroundColor: COLORS.blanco,
    border: "0.5 solid #E5E7EB",
    padding: 2,
    borderRadius: 2,
  },
  qrImage: {
    width: "100%",
    height: "100%",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 4,
    borderTop: "0.5 solid #E5E7EB",
  },
  folioLabel: {
    fontSize: 4,
    color: COLORS.grisMedio,
    textTransform: "uppercase",
    marginBottom: 1,
  },
  folioValue: {
    fontSize: 6,
    color: COLORS.azulMedio,
    fontWeight: "bold",
    fontFamily: "Courier",
  },
  // ===== REVERSO =====
  backContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    flexDirection: "column",
    backgroundColor: COLORS.blanco,
  },
  emergencyHeader: {
    backgroundColor: COLORS.rojoEmergencia,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  emergencyHeaderText: {
    color: COLORS.blanco,
    fontSize: 8,
    fontWeight: "bold",
    letterSpacing: 1.5,
  },
  backContent: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: "column",
    gap: 4,
  },
  sectionTitle: {
    fontSize: 5,
    color: COLORS.azulMedio,
    fontWeight: "bold",
    textTransform: "uppercase",
    borderBottom: "0.5 solid #E5E7EB",
    paddingBottom: 2,
    marginBottom: 2,
  },
  medicalGrid: {
    flexDirection: "row",
    gap: 4,
  },
  medicalCard: {
    flex: 1,
    backgroundColor: COLORS.azulClaro,
    padding: 4,
    borderRadius: 3,
    borderLeft: "2 solid " + COLORS.azulMedio,
  },
  medicalLabel: {
    fontSize: 4,
    color: COLORS.grisMedio,
    textTransform: "uppercase",
    marginBottom: 1,
  },
  medicalValue: {
    fontSize: 9,
    color: COLORS.rojoEmergencia,
    fontWeight: "bold",
  },
  medicalText: {
    fontSize: 6,
    color: COLORS.grisOscuro,
    fontWeight: "bold",
  },
  contactBox: {
    backgroundColor: COLORS.azulClaro,
    padding: 4,
    borderRadius: 3,
    border: "0.5 solid #E5E7EB",
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
    fontSize: 5,
  },
  contactKey: {
    color: COLORS.grisMedio,
    fontWeight: "bold",
  },
  contactValue: {
    color: COLORS.grisOscuro,
    fontWeight: "bold",
  },
  legalText: {
    fontSize: 3.5,
    color: COLORS.grisMedio,
    textAlign: "center",
    lineHeight: 1.3,
    marginTop: "auto",
    paddingTop: 3,
    borderTop: "0.5 solid #D1D5DB",
  },
  websiteText: {
    fontSize: 4,
    color: COLORS.azulMedio,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 2,
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
  qrCodeDataUrl?: string;
  datosEmergencia?: {
    tipoSanguineo: string;
    alergiasCondiciones: string;
    nombreContacto: string;
    parentesco: string;
    telefonoContacto: string;
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
  qrCodeDataUrl,
  datosEmergencia,
}: CredencialPDFProps) => {
  return (
    <Document>
      {/* FRENTE */}
      <Page size={[CARD_WIDTH, CARD_HEIGHT]} style={styles.page}>
        <View style={styles.frontContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>REP-TecNM</Text>
              <Text style={styles.headerSubtitle}>Red de Egresados de Posgrado</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>ACTIVO</Text>
            </View>
          </View>

          {/* Body */}
          <View style={styles.body}>
            {/* Photo */}
            <View style={styles.photoContainer}>
              {fotografiaUrl ? (
                <Image src={fotografiaUrl} style={styles.photo} />
              ) : (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: 20, color: COLORS.grisMedio }}></Text>
                </View>
              )}
            </View>

            {/* Info */}
            <View style={styles.infoContainer}>
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

            {/* QR */}
            {qrCodeDataUrl && (
              <View style={styles.qrContainer}>
                <Image src={qrCodeDataUrl} style={styles.qrImage} />
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View>
              <Text style={styles.folioLabel}>FOLIO DE VERIFICACIÓN</Text>
              <Text style={styles.folioValue}>{folio}</Text>
            </View>
          </View>
        </View>
      </Page>

      {/* REVERSO */}
      <Page size={[CARD_WIDTH, CARD_HEIGHT]} style={styles.page}>
        <View style={styles.backContainer}>
          {/* Emergency Header */}
          <View style={styles.emergencyHeader}>
            <Text style={styles.emergencyHeaderText}>EN CASO DE EMERGENCIA</Text>
          </View>

          {/* Content */}
          <View style={styles.backContent}>
            {datosEmergencia ? (
              <>
                <Text style={styles.sectionTitle}>Información Médica</Text>
                <View style={styles.medicalGrid}>
                  <View style={styles.medicalCard}>
                    <Text style={styles.medicalLabel}>Tipo Sanguíneo</Text>
                    <Text style={styles.medicalValue}>{datosEmergencia.tipoSanguineo}</Text>
                  </View>
                  <View style={styles.medicalCard}>
                    <Text style={styles.medicalLabel}>Alergias</Text>
                    <Text style={styles.medicalText}>
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
                    <Text style={styles.contactValue}>{datosEmergencia.telefonoContacto}</Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 5, color: COLORS.grisMedio, textAlign: "center" }}>
                  El afiliado no ha configurado{"\n"}datos de emergencia
                </Text>
              </View>
            )}

            {/* Legal */}
            <Text style={styles.legalText}>
              Esta credencial es un documento personal e intransferible propiedad de la Red de Posgrados del TecNM (REP-TecNM). 
              Los datos médicos y de contacto son confidenciales y para uso exclusivo en situaciones de emergencia.
            </Text>
            <Text style={styles.websiteText}>www.reptecnm.org.mx</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
