import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import QRCode from "qrcode";

// Colores institucionales
const COLORS = {
  primary: "#004B87",
  primaryDark: "#003a6b",
  secondary: "#C9A227",
  emergency: "#DC2626",
  emergencyLight: "#FEF2F2",
  white: "#FFFFFF",
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },
};

// Estilos para tamaño carnet (252x396 puntos = 3.5" x 5.5")
const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.white,
  },
  // FRENTE
  frente: {
    width: 252,
    height: 396,
    padding: 0,
    position: "relative",
    overflow: "hidden",
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: "12 10",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLogo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  logoCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "bold",
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: COLORS.white,
    fontSize: 7,
    opacity: 0.9,
  },
  statusBadge: {
    backgroundColor: COLORS.secondary,
    color: COLORS.white,
    padding: "3 8",
    borderRadius: 3,
    fontSize: 7,
    fontWeight: "bold",
  },
  body: {
    padding: "10 10",
    flexDirection: "row",
    gap: 10,
  },
  photoContainer: {
    width: 70,
    height: 90,
    backgroundColor: COLORS.gray[100],
    borderRadius: 4,
    overflow: "hidden",
    border: `1 solid ${COLORS.gray[200]}`,
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    fontSize: 7,
    color: COLORS.gray[400],
  },
  photo: {
    width: 70,
    height: 90,
  },
  infoContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  infoRow: {
    marginBottom: 6,
  },
  label: {
    fontSize: 6,
    color: COLORS.gray[500],
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  value: {
    fontSize: 9,
    color: COLORS.gray[800],
    fontWeight: "bold",
  },
  valueLarge: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "8 10",
    borderTop: `1 solid ${COLORS.gray[200]}`,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  folioContainer: {
    flex: 1,
  },
  qrContainer: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.white,
    padding: 2,
    borderRadius: 3,
    border: `1 solid ${COLORS.gray[200]}`,
  },
  qrImage: {
    width: 56,
    height: 56,
  },
  footerText: {
    fontSize: 5,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  // REVERSO
  reverso: {
    width: 252,
    height: 396,
    padding: 0,
    position: "relative",
    overflow: "hidden",
    backgroundColor: COLORS.white,
  },
  emergencyHeader: {
    backgroundColor: COLORS.emergency,
    padding: "10 10",
    alignItems: "center",
    justifyContent: "center",
  },
  emergencyTitle: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  emergencyBody: {
    padding: "10 10",
    flex: 1,
  },
  bloodTypeContainer: {
    backgroundColor: COLORS.emergencyLight,
    border: `1 solid ${COLORS.emergency}`,
    borderRadius: 4,
    padding: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  bloodTypeLabel: {
    fontSize: 6,
    color: COLORS.emergency,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  bloodTypeValue: {
    fontSize: 20,
    color: COLORS.emergency,
    fontWeight: "bold",
    marginTop: 2,
  },
  emergencySection: {
    marginBottom: 10,
  },
  emergencyLabel: {
    fontSize: 6,
    color: COLORS.gray[500],
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  emergencyValue: {
    fontSize: 9,
    color: COLORS.gray[800],
    fontWeight: "bold",
  },
  emergencyValueNormal: {
    fontSize: 8,
    color: COLORS.gray[700],
  },
  emergencyPhone: {
    fontSize: 10,
    color: COLORS.emergency,
    fontWeight: "bold",
    marginTop: 2,
  },
  disclaimer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "6 10",
    borderTop: `1 solid ${COLORS.gray[200]}`,
    backgroundColor: COLORS.gray[50],
  },
  disclaimerText: {
    fontSize: 5,
    color: COLORS.gray[500],
    textAlign: "center",
    lineHeight: 1.3,
  },
});

interface CredencialPDFProps {
  numeroAfiliado: string;
  nombreCompleto: string;
  instituto: string;
  anioAprobacion: number;
  folio: string;
  fotografiaUrl?: string;
  datosEmergencia?: {
    tipoSanguineo: string;
    alergiasCondiciones: string;
    nombreContacto: string;
    parentesco: string;
    telefonoContacto: string;
  };
}

export const CredencialPDF = ({
  numeroAfiliado,
  nombreCompleto,
  instituto,
  anioAprobacion,
  folio,
  fotografiaUrl,
  datosEmergencia,
}: CredencialPDFProps) => {
  // Generar QR como base64
  const qrCodeDataUrl = QRCode.toDataURL(
    `https://reptecnm.org.mx/verificar/${folio}`,
    {
      width: 200,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    }
  );

  return (
    <Document>
      {/* FRENTE */}
      <Page size={[252, 396]} style={styles.page}>
        <View style={styles.frente}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLogo}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>R</Text>
              </View>
              <View>
                <Text style={styles.headerTitle}>REP-TecNM</Text>
                <Text style={styles.headerSubtitle}>Red de Egresados de Posgrado</Text>
              </View>
            </View>
            <Text style={styles.statusBadge}>ACTIVO</Text>
          </View>

          {/* Body */}
          <View style={styles.body}>
            {/* Foto */}
            <View style={styles.photoContainer}>
              {fotografiaUrl ? (
                <Image src={fotografiaUrl} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text>Sin fotografía</Text>
                </View>
              )}
            </View>

            {/* Información */}
            <View style={styles.infoContainer}>
              <View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Número de Afiliado</Text>
                  <Text style={styles.valueLarge}>{numeroAfiliado}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Nombre Completo</Text>
                  <Text style={styles.value}>{nombreCompleto}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Instituto de Procedencia</Text>
                  <Text style={styles.value}>{instituto}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Año de Aprobación</Text>
                  <Text style={styles.value}>{anioAprobacion}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Footer con QR y Folio */}
          <View style={styles.footer}>
            <View style={styles.folioContainer}>
              <Text style={styles.label}>Folio de Verificación</Text>
              <Text style={styles.value}>{folio}</Text>
              <Text style={styles.footerText}>
                Escanea el QR para verificar
              </Text>
            </View>
            <View style={styles.qrContainer}>
              <Image src={qrCodeDataUrl} style={styles.qrImage} />
            </View>
          </View>
        </View>
      </Page>

      {/* REVERSO */}
      <Page size={[252, 396]} style={styles.page}>
        <View style={styles.reverso}>
          {/* Header de Emergencia */}
          <View style={styles.emergencyHeader}>
            <Text style={styles.emergencyTitle}>⚠ EN CASO DE EMERGENCIA</Text>
          </View>

          {/* Contenido de Emergencia */}
          <View style={styles.emergencyBody}>
            {datosEmergencia ? (
              <>
                {/* Tipo Sanguíneo */}
                <View style={styles.bloodTypeContainer}>
                  <Text style={styles.bloodTypeLabel}>Tipo Sanguíneo</Text>
                  <Text style={styles.bloodTypeValue}>
                    {datosEmergencia.tipoSanguineo}
                  </Text>
                </View>

                {/* Alergias */}
                {datosEmergencia.alergiasCondiciones && (
                  <View style={styles.emergencySection}>
                    <Text style={styles.emergencyLabel}>
                      Alergias / Condiciones Médicas
                    </Text>
                    <Text style={styles.emergencyValueNormal}>
                      {datosEmergencia.alergiasCondiciones}
                    </Text>
                  </View>
                )}

                {/* Contacto de Emergencia */}
                <View style={styles.emergencySection}>
                  <Text style={styles.emergencyLabel}>Contacto de Emergencia</Text>
                  <Text style={styles.emergencyValue}>
                    {datosEmergencia.nombreContacto}
                  </Text>
                  <Text style={styles.emergencyValueNormal}>
                    {datosEmergencia.parentesco}
                  </Text>
                  <Text style={styles.emergencyPhone}>
                     {datosEmergencia.telefonoContacto}
                  </Text>
                </View>
              </>
            ) : (
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 8, color: COLORS.gray[400], textAlign: "center" }}>
                  El afiliado no ha configurado{"\n"}datos de emergencia
                </Text>
              </View>
            )}
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              Esta credencial es propiedad de REP-TecNM. Si la encuentra, por favor
              devuélvala al afiliado o contacte a la asociación. Los datos de emergencia
              son confidenciales y solo deben usarse en situaciones de urgencia médica.
            </Text>
            <Text style={[styles.disclaimerText, { marginTop: 2 }]}>
              Folio: {folio} • reptecnm.org.mx
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
